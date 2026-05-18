import {configureStore} from "@reduxjs/toolkit" 
import rootRedcuer from "./rootRedcuer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { quizApi } from "@/features/api/quizApi";
import { certificateApi } from "@/features/api/certificateApi";
import { instructorApi } from "@/features/api/instructorApi";
import { aiTutorApi } from "@/features/api/aiTutorApi";

export const appStore = configureStore({
    reducer: rootRedcuer,
    middleware:(defaultMiddleware) => defaultMiddleware().concat(
        authApi.middleware, 
        courseApi.middleware, 
        purchaseApi.middleware, 
        courseProgressApi.middleware,
        quizApi.middleware,
        certificateApi.middleware,
        instructorApi.middleware,
        aiTutorApi.middleware
    )
});