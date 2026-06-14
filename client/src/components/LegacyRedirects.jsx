import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/utils/routes";

export const LegacyCourseDetailRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={ROUTES.course(courseId)} replace />;
};

export const LegacySearchRedirect = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  return <Navigate to={ROUTES.catalogSearch(query || "")} replace />;
};

export const LegacyCourseProgressRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={ROUTES.courseLearn(courseId)} replace />;
};
