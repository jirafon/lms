import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getUserRole } from "@/utils/userRole";
import { getHomePath, ROUTES } from "@/utils/routes";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector((store) => store.auth);

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} />;
  }

  return children;
};

export const AuthenticatedUser = ({ children }) => {
  const { user, isAuthenticated, authChecked } = useSelector(
    (store) => store.auth
  );

  if (!authChecked) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, authChecked } = useSelector(
    (store) => store.auth
  );
  const userRole = getUserRole(user);

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} />;
  }

  if (userRole !== "instructor") {
    return <Navigate to={ROUTES.app} replace />;
  }

  return children;
};
