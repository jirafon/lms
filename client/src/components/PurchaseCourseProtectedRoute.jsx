import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";

import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PurchaseCourseProtectedRoute = ({children}) => {
    const { t } = useTranslation();
    const {courseId} = useParams();
    const {data, isLoading} = useGetCourseDetailWithStatusQuery(courseId);

    if(isLoading) return <p>{t("common.loading")}</p>

    return data?.purchased ? children : <Navigate to={`/course-detail/${courseId}`}/>
}
export default PurchaseCourseProtectedRoute;