import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";

import { ROUTES } from "@/utils/routes";

import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PurchaseCourseProtectedRoute = ({children}) => {
    const { t } = useTranslation();
    const {courseId} = useParams();
    const {data, isLoading} = useGetCourseDetailWithStatusQuery(courseId);

    if(isLoading) return <p>{t("common.loading")}</p>

    return data?.purchased ? children : <Navigate to={ROUTES.course(courseId)} />
}
export default PurchaseCourseProtectedRoute;