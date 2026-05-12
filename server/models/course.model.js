import mongoose from "mongoose"

const flowPricingSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        min: 0,
    },
    currency: {
        type: String,
        uppercase: true,
        trim: true,
    },
}, { _id: false });

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle: {type:String}, 
    description:{ type:String},
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advance"]
    },
    coursePrice:{
        type:Number
    },
    currency: {
        type: String,
        default: 'USD'
    },
    flowPricing: {
        type: flowPricingSchema,
        default: () => ({
            enabled: false,
            currency: 'CLP',
        }),
    },
    courseThumbnail:{
        type:String
    },
    enrolledStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublished:{
        type:Boolean,
        default:false
    }

}, {timestamps:true});

export const Course = mongoose.model("Course", courseSchema);