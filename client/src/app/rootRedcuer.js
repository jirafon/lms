import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"; 
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { quizApi } from "@/features/api/quizApi";
import { certificateApi } from "@/features/api/certificateApi";
import { instructorApi } from "@/features/api/instructorApi";
import { aiTutorApi } from "@/features/api/aiTutorApi";

const rootRedcuer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [quizApi.reducerPath]:quizApi.reducer,
    [certificateApi.reducerPath]:certificateApi.reducer,
    [instructorApi.reducerPath]: instructorApi.reducer,
    [aiTutorApi.reducerPath]: aiTutorApi.reducer,
    auth:authReducer, 
});
export default rootRedcuer;