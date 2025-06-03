import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
  
    firstName: {
      type: String,
   
    },
    lastName: {
      type: String,

    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
    },
    picturePath: {
      type: String,
      default: "",
    },
  
    location: {
      type: String,
      default: "",
    },

    occupation: {
      type: String,
      default: "",
    },
 
    
    userprofile: {
      type: String,
      default: "",
    },

    idcontrato: {
      type: String,
      default: "",
    
    },

    campaignid: {
      type: String,
      default: "",
    
    },


    area: {
      type: String,
      default: "",
    },

    rut: {
      type: String,
      default: "",
    },

    celular: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "",
    },

    idcompany: {
      type: String,
      default: "",
    },
  
    rangoAprobacion: {
      type: String,
      default: "",
    },

    wagon: {
      type: String,
      default: "",
    },

    investigador: { type: String, default: "No" }, // o Boolean si prefieres
 role: {
      type: String,
      enum: ["instructor", "student"],
      default: "student",
    },

     enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
    
    nationality: { type: String, default: "" },

    level: { type: String, default: "" },

    messagesRead: { type: String, default: "" },

assignBoletin: { type: Boolean, default: false },

  },

  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);