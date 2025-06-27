import mongoose from "mongoose";
const coursePurchaseSchema = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'completed', 'failed', 'cancelled'],
        default:'pending'
    },
    paymentId:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        enum:['stripe', 'paypal'],
        required:true
    },
    paymentDetails:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    }

},{timestamps:true});
export const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema);