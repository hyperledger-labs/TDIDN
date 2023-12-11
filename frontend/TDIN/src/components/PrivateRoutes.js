import { Outlet, Navigate } from 'react-router-dom'
import { isExpired } from "react-jwt";

const PrivateRoutes = () => {
    let auth = localStorage.getItem('token')
    const isMyTokenExpired = isExpired(auth);
    if(isMyTokenExpired) localStorage.clear();
    return (
        localStorage.getItem('token') ? <Outlet /> : <Navigate to="/" />
    )
}

export default PrivateRoutes