import mongoose from 'mongoose';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import connectDB from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

const checkCourses = async () => {
  try {
    await connectDB();
    
    // Get all courses
    const courses = await Course.find({}).populate('lectures');
    
    console.log(`\n📚 TOTAL COURSES FOUND: ${courses.length}\n`);
    console.log("=" .repeat(60));
    
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. COURSE: ${course.courseTitle}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Description: ${course.subTitle || 'No description'}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Level: ${course.courseLevel}`);
      console.log(`   Price: $${course.coursePrice}`);
      console.log(`   Published: ${course.isPublished ? '✅ YES' : '❌ NO'}`);
      console.log(`   Lectures: ${course.lectures?.length || 0}`);
      console.log(`   Created: ${course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}`);
      
      if (course.lectures && course.lectures.length > 0) {
        console.log(`   First lecture: ${course.lectures[0]?.lectureTitle || 'No title'}`);
      }
    });
    
    console.log("\n" + "=".repeat(60));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Courses: ${courses.length}`);
    console.log(`   Published Courses: ${courses.filter(c => c.isPublished).length}`);
    console.log(`   Unpublished Courses: ${courses.filter(c => !c.isPublished).length}`);
    
    const coursesByCategory = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📂 BY CATEGORY:`);
    Object.entries(coursesByCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} courses`);
    });
    
  } catch (error) {
    console.error('Error checking courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

checkCourses();