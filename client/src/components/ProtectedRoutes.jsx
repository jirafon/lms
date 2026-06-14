import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";
import { getUserRole } from "@/utils/userRole";

export const ProtectedRoute = ({children}) => {
    const {isAuthenticated, authChecked} = useSelector(store=>store.auth);

    if(!authChecked){
        return null;
    }

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    return children;
}
export const AuthenticatedUser = ({children}) => {
    const {user, isAuthenticated, authChecked} = useSelector(store=>store.auth);
    const userRole = getUserRole(user);

    if(!authChecked){
        return null;
    }

    if(isAuthenticated){
        return <Navigate to={userRole === "instructor" ? "/admin/course" : "/my-learning"}/>
    }

    return children;
}

export const AdminRoute = ({children}) => {
    const {user, isAuthenticated, authChecked} = useSelector(store=>store.auth);
    const userRole = getUserRole(user);

    if(!authChecked){
        return null;
    }

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    if(userRole !== "instructor"){
        return <Navigate to="/my-learning"/>
    }

    return children;
}