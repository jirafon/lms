import mongoose from 'mongoose';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import { QuizAttempt } from './models/quizAttempt.model.js';
import { CourseProgress } from './models/courseProgress.model.js';
import connectDB from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteOtherCourses = async () => {
  try {
    await connectDB();
    
    // ID of the privacy course to keep
    const privacyCourseId = '69f8dc459d0ba24e4f1b322b';
    
    console.log('\n🗑️  DELETING ALL COURSES EXCEPT PRIVACY COURSE...\n');
    
    // Find all courses except the privacy course
    const coursesToDelete = await Course.find({ 
      _id: { $ne: new mongoose.Types.ObjectId(privacyCourseId) } 
    });
    
    console.log(`Found ${coursesToDelete.length} courses to delete:`);
    
    for (const course of coursesToDelete) {
      console.log(`\n❌ DELETING: ${course.courseTitle} (ID: ${course._id})`);
      
      // Get course lectures
      const lectures = await Lecture.find({ courseId: course._id });
      console.log(`   - Found ${lectures.length} lectures to delete`);
      
      // Delete quizzes associated with these lectures
      let deletedQuizzes = 0;
      for (const lecture of lectures) {
        const quizzes = await Quiz.find({ lectureId: lecture._id });
        if (quizzes.length > 0) {
          await Quiz.deleteMany({ lectureId: lecture._id });
          deletedQuizzes += quizzes.length;
          
          // Delete quiz attempts for these quizzes
          for (const quiz of quizzes) {
            await QuizAttempt.deleteMany({ quizId: quiz._id });
          }
        }
      }
      console.log(`   - Deleted ${deletedQuizzes} quizzes and their attempts`);
      
      // Delete lectures
      await Lecture.deleteMany({ courseId: course._id });
      console.log(`   - Deleted ${lectures.length} lectures`);
      
      // Delete course progress records
      const progressCount = await CourseProgress.countDocuments({ courseId: course._id });
      await CourseProgress.deleteMany({ courseId: course._id });
      console.log(`   - Deleted ${progressCount} course progress records`);
      
      // Finally delete the course
      await Course.findByIdAndDelete(course._id);
      console.log(`   ✅ Course "${course.courseTitle}" completely deleted`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Verify only privacy course remains
    const remainingCourses = await Course.find({}).populate('lectures');
    
    console.log(`\n📚 REMAINING COURSES: ${remainingCourses.length}`);
    
    if (remainingCourses.length === 1 && remainingCourses[0]._id.toString() === privacyCourseId) {
      const privacyCourse = remainingCourses[0];
      console.log(`\n✅ SUCCESS! Only privacy course remains:`);
      console.log(`   📖 Title: ${privacyCourse.courseTitle}`);
      console.log(`   🆔 ID: ${privacyCourse._id}`);
      console.log(`   📚 Lectures: ${privacyCourse.lectures.length}`);
      console.log(`   📊 Published: ${privacyCourse.isPublished ? 'YES' : 'NO'}`);
      console.log(`   📅 Created: ${new Date(privacyCourse.createdAt).toLocaleDateString()}`);
    } else {
      console.log('❌ ERROR: Unexpected number of courses remaining!');
      remainingCourses.forEach(course => {
        console.log(`   - ${course.courseTitle} (${course._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error deleting courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

deleteOtherCourses();