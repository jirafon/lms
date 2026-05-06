import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

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

    if(!authChecked){
        return null;
    }

    if(isAuthenticated){
        return <Navigate to={user?.role === "instructor" ? "/admin" : "/"}/>
    }

    return children;
}

export const AdminRoute = ({children}) => {
    const {user, isAuthenticated, authChecked} = useSelector(store=>store.auth);

    if(!authChecked){
        return null;
    }

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    if(user?.role !== "instructor"){
        return <Navigate to="/my-learning"/>
    }

    return children;
}