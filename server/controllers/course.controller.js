import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { uploadMedia, deleteMediaFromS3, extractS3KeyFromUrl, deleteVideoFromS3 } from "../utils/s3.js";
import { getMissingFields, sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { isValidObjectId, validateCoursePayload, validateLecturePayload } from "../utils/validators.js";

const getOrderedLectures = (lectures = []) => {
    return lectures
        .map((lecture, index) => ({
            lecture,
            order: lecture.lectureOrder || index + 1,
        }))
        .sort((first, second) => first.order - second.order)
        .map(({ lecture }) => lecture);
};

const normalizeLectureOrder = async (courseId) => {
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
        return null;
    }

    const orderedLectures = getOrderedLectures(course.lectures);

    await Promise.all(
        orderedLectures.map((lecture, index) =>
            Lecture.findByIdAndUpdate(lecture._id, { lectureOrder: index + 1 })
        )
    );

    course.lectures = orderedLectures.map((lecture) => lecture._id);
    await course.save();

    return orderedLectures.map((lecture, index) => ({
        ...lecture.toObject(),
        lectureOrder: index + 1,
    }));
};

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        const missingFields = getMissingFields({ courseTitle, category });
        if(missingFields.length > 0) {
            return sendError(res, {
                status: 400,
                message:"Course title and category is required.",
                errors: missingFields,
            })
        }

        const validationErrors = validateCoursePayload(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: "Invalid course payload",
                errors: validationErrors,
            });
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return sendSuccess(res, {
            status: 201,
            course,
            message:"Course created."
        })
    } catch (error) {
        logger.error("Failed to create course", { error: error.message, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to create course"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = [], sortByPrice =""} = req.query;

        // create search query
        const searchCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query, $options:"i"}},
                {subTitle: {$regex:query, $options:"i"}},
                {category: {$regex:query, $options:"i"}},
            ]
        }

        // if categories selected
        if(categories.length > 0) {
            searchCriteria.category = {$in: categories};
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return sendSuccess(res, {
            courses: courses || []
        });

    } catch (error) {
        logger.error("Failed to search courses", { error: error.message, query: req.query?.query });
        return sendError(res, {
            status: 500,
            message: "Failed to search courses",
        });
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return sendError(res, {
                status: 404,
                message:"Course not found"
            })
        }
        return sendSuccess(res, {
            courses,
        })
    } catch (error) {
        logger.error("Failed to get published courses", { error: error.message });
        return sendError(res, {
            status: 500,
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return sendError(res, {
                status: 404,
                courses:[],
                message:"Course not found"
            })
        };
        return sendSuccess(res, {
            courses,
        })
    } catch (error) {
        logger.error("Failed to get creator courses", { error: error.message, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to create course"
        })
    }
}

export const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findOne({ _id: courseId, creator: userId }).select("_id courseTitle");
        if (!course) {
            return sendError(res, {
                status: 404,
                message: "Course not found"
            });
        }

        const purchases = await CoursePurchase.find({
            courseId,
            status: "completed",
        }).populate({
            path: "userId",
            select: "name email idcontrato idcompany",
        });

        const uniqueStudents = new Map();

        for (const purchase of purchases) {
            const student = purchase.userId;
            if (!student) {
                continue;
            }

            uniqueStudents.set(String(student._id), {
                id: student._id,
                name: student.name || "N/A",
                email: student.email || "N/A",
                idcontrato: student.idcontrato || "N/A",
                clientName: student.idcompany || "N/A",
            });
        }

        return sendSuccess(res, {
            courseTitle: course.courseTitle,
            students: Array.from(uniqueStudents.values()),
        });
    } catch (error) {
        logger.error("Failed to load course students", { error: error.message, courseId: req.params.courseId, userId: req.id });
        return sendError(res, {
            status: 500,
            message: "Failed to load course students"
        });
    }
}

export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }

        const validationErrors = validateCoursePayload(req.body, { partial: true });
        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: "Invalid course payload",
                errors: validationErrors,
            });
        }

        let course = await Course.findById(courseId);
        if (!course) {
            return sendError(res, {
                status: 404,
                message: "Course not found!"
            });
        }
        let courseThumbnail;
        if (thumbnail) {
            // Delete old thumbnail from S3 if it exists
            if (course.courseThumbnail && (course.courseThumbnail.includes('s3') || course.courseThumbnail.includes('cloudfront'))) {
                const key = extractS3KeyFromUrl(course.courseThumbnail);
                if (key) {
                    await deleteMediaFromS3(key);
                }
            }
            // Upload new thumbnail to S3
            const s3Response = await uploadMedia(thumbnail.path, thumbnail.originalname);
            courseThumbnail = s3Response.url;
        }

        // Build updateData object with proper validation
        const updateData = { courseTitle, subTitle, description, category, courseLevel, courseThumbnail, currency: 'USD' };

        // Only include coursePrice if it's a valid number
        if (coursePrice !== undefined && coursePrice !== null && coursePrice !== "" && coursePrice !== "undefined") {
            const numericPrice = Number(coursePrice);
            if (!isNaN(numericPrice)) {
                updateData.coursePrice = numericPrice;
            }
        }

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return sendSuccess(res, {
            course,
            message: "Course updated successfully."
        })

    } catch (error) {
        logger.error("Failed to edit course", { error: error.message, courseId: req.params.courseId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to create course"
        })
    }
}
export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }

        const course = await Course.findById(courseId);

        if(!course){
            return sendError(res, {
                status: 404,
                message:"Course not found!"
            })
        }
        return sendSuccess(res, {
            course
        })
    } catch (error) {
        logger.error("Failed to get course by id", { error: error.message, courseId: req.params.courseId });
        return sendError(res, {
            status: 500,
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle, lectureDescription, supportMaterials = []} = req.body;
        const {courseId} = req.params;

        const missingFields = getMissingFields({ lectureTitle, courseId });
        if(missingFields.length > 0){
            return sendError(res, {
                status: 400,
                message:"Lecture title is required",
                errors: missingFields,
            })
        };

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }

        const validationErrors = validateLecturePayload({ lectureTitle, lectureDescription, supportMaterials });
        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture payload",
                errors: validationErrors,
            });
        }

        const course = await Course.findById(courseId);
        const nextLectureOrder = (course?.lectures?.length || 0) + 1;

        // create lecture
        const lecture = await Lecture.create({
            lectureTitle,
            lectureDescription,
            lectureOrder: nextLectureOrder,
            supportMaterials,
        });

        if(course){
            course.lectures.push(lecture._id);
            await course.save();
            await normalizeLectureOrder(courseId);
        }

        return sendSuccess(res, {
            status: 201,
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        logger.error("Failed to create lecture", { error: error.message, courseId: req.params.courseId });
        return sendError(res, {
            status: 500,
            message:"Failed to create lecture"
        })
    }
}
export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return sendError(res, {
                status: 404,
                message:"Course not found"
            })
        }
        return sendSuccess(res, {
            lectures: getOrderedLectures(course.lectures)
        });

    } catch (error) {
        logger.error("Failed to get course lectures", { error: error.message, courseId: req.params.courseId });
        return sendError(res, {
            status: 500,
            message:"Failed to get lectures"
        })
    }
}
export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, lectureDescription, lectureOrder, videoInfo, isPreviewFree, supportMaterials} = req.body;
        
        const {courseId, lectureId} = req.params;

        if (!isValidObjectId(courseId) || !isValidObjectId(lectureId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture or course id",
                errors: ["courseId and lectureId must be valid ids"],
            });
        }

        const validationErrors = validateLecturePayload({
            lectureTitle,
            lectureDescription,
            lectureOrder,
            videoInfo,
            isPreviewFree,
            supportMaterials,
        }, { partial: true });
        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture payload",
                errors: validationErrors,
            });
        }

        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return sendError(res, {
                status: 404,
                message:"Lecture not found!"
            })
        }

        // update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(lectureDescription !== undefined) lecture.lectureDescription = lectureDescription;
        if(videoInfo?.videoUrl) {
            lecture.videoUrl = videoInfo.videoUrl;
        }
        if(videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        if(Array.isArray(supportMaterials)) {
            lecture.supportMaterials = supportMaterials;
        }
        if(Number.isInteger(lectureOrder) && lectureOrder > 0) {
            lecture.lectureOrder = lectureOrder;
        }
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };

        if (course) {
            await normalizeLectureOrder(courseId);
        }

        return sendSuccess(res, {
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        logger.error("Failed to edit lecture", { error: error.message, courseId: req.params.courseId, lectureId: req.params.lectureId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to edit lectures"
        })
    }
}
export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        if (!isValidObjectId(lectureId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture id",
                errors: ["lectureId must be a valid id"],
            });
        }
        const course = await Course.findOne({ lectures: lectureId }).select("_id");
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return sendError(res, {
                status: 404,
                message:"Lecture not found!"
            });
        }
        // delete the video from S3 as well
        if(lecture.videoUrl && (lecture.videoUrl.includes('s3') || lecture.videoUrl.includes('cloudfront'))){
            const key = extractS3KeyFromUrl(lecture.videoUrl);
            if (key) {
                await deleteVideoFromS3(key);
            }
        } else if(lecture.publicId){
            // Fallback to Cloudinary if it's an old video
            await deleteVideoFromS3(lecture.publicId);
        }

        if (lecture.supportMaterials?.length) {
            for (const material of lecture.supportMaterials) {
                const key = material.key || extractS3KeyFromUrl(material.url);
                if (key) {
                    await deleteMediaFromS3(key);
                }
            }
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        if (course?._id) {
            await normalizeLectureOrder(course._id);
        }

        return sendSuccess(res, {
            message:"Lecture removed successfully."
        })
    } catch (error) {
        logger.error("Failed to remove lecture", { error: error.message, lectureId: req.params.lectureId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        if (!isValidObjectId(lectureId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture id",
                errors: ["lectureId must be a valid id"],
            });
        }
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return sendError(res, {
                status: 404,
                message:"Lecture not found!"
            });
        }
        return sendSuccess(res, {
            lecture
        });
    } catch (error) {
        logger.error("Failed to get lecture by id", { error: error.message, lectureId: req.params.lectureId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to get lecture by id"
        })
    }
}

export const reorderLecture = async (req,res) => {
    try {
        const { courseId, lectureId } = req.params;
        const { direction } = req.body;
        const userId = req.id;

        if (!isValidObjectId(courseId) || !isValidObjectId(lectureId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid lecture or course id",
                errors: ["courseId and lectureId must be valid ids"],
            });
        }

        if (!["up", "down"].includes(direction)) {
            return sendError(res, {
                status: 400,
                message: "Invalid direction",
                errors: ["direction must be either up or down"],
            });
        }

        const course = await Course.findOne({ _id: courseId, creator: userId }).populate("lectures");
        if (!course) {
            return sendError(res, {
                status: 404,
                message: "Course not found"
            });
        }

        const orderedLectures = getOrderedLectures(course.lectures);
        const currentIndex = orderedLectures.findIndex((lecture) => lecture._id.toString() === lectureId);

        if (currentIndex === -1) {
            return sendError(res, {
                status: 404,
                message: "Lecture not found"
            });
        }

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= orderedLectures.length) {
            return sendError(res, {
                status: 400,
                message: "Lecture cannot be moved further"
            });
        }

        [orderedLectures[currentIndex], orderedLectures[targetIndex]] = [orderedLectures[targetIndex], orderedLectures[currentIndex]];

        await Promise.all(
            orderedLectures.map((lecture, index) =>
                Lecture.findByIdAndUpdate(lecture._id, { lectureOrder: index + 1 })
            )
        );

        course.lectures = orderedLectures.map((lecture) => lecture._id);
        await course.save();

        return sendSuccess(res, {
            message: "Lecture order updated successfully.",
            lectures: orderedLectures.map((lecture, index) => ({
                ...lecture.toObject(),
                lectureOrder: index + 1,
            }))
        });
    } catch (error) {
        logger.error("Failed to reorder lecture", { error: error.message, courseId: req.params.courseId, lectureId: req.params.lectureId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to reorder lecture"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }

        if (!["true", "false"].includes(String(publish))) {
            return sendError(res, {
                status: 400,
                message: "Invalid publish value",
                errors: ["publish must be true or false"],
            });
        }
        const course = await Course.findById(courseId);
        if(!course){
            return sendError(res, {
                status: 404,
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return sendSuccess(res, {
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        logger.error("Failed to update publish status", { error: error.message, courseId: req.params.courseId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to update status"
        })
    }
}

export const removeCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const userId = req.id;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                status: 400,
                message: "Invalid course id",
                errors: ["courseId must be a valid id"],
            });
        }

        // Find the course and verify ownership
        const course = await Course.findById(courseId);
        if(!course){
            return sendError(res, {
                status: 404,
                message:"Course not found!"
            });
        }

        // Check if the user is the creator of the course
        if(course.creator.toString() !== userId){
            return sendError(res, {
                status: 403,
                message:"You are not authorized to delete this course!"
            });
        }

        // Delete course thumbnail from S3 if it exists
        if(course.courseThumbnail && (course.courseThumbnail.includes('s3') || course.courseThumbnail.includes('cloudfront'))){
            const key = extractS3KeyFromUrl(course.courseThumbnail);
            if (key) {
                await deleteMediaFromS3(key);
            }
        }

        // Delete all lectures and their videos
        for(const lectureId of course.lectures){
            const lecture = await Lecture.findById(lectureId);
            if(lecture){
                // Delete video from S3
                if(lecture.videoUrl && (lecture.videoUrl.includes('s3') || lecture.videoUrl.includes('cloudfront'))){
                    const key = extractS3KeyFromUrl(lecture.videoUrl);
                    if (key) {
                        await deleteVideoFromS3(key);
                    }
                } else if(lecture.publicId){
                    // Fallback to Cloudinary if it's an old video
                    await deleteVideoFromS3(lecture.publicId);
                }
                // Delete the lecture
                await Lecture.findByIdAndDelete(lectureId);
            }
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return sendSuccess(res, {
            message:"Course removed successfully."
        });
    } catch (error) {
        logger.error("Failed to remove course", { error: error.message, courseId: req.params.courseId, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to remove course"
        })
    }
}
