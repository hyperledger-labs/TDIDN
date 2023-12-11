import { Outlet, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { isExpired } from "react-jwt";

const PrivateRoutes = () => {
    const dispatch = useDispatch()

    let auth = localStorage.getItem('accessToken')
    const isMyTokenExpired = isExpired(auth);
    if (isMyTokenExpired) localStorage.clear();

    if (isMyTokenExpired) dispatch({ type: 'UPDATE_URL', payload: window.location.href })
    return (
        !isMyTokenExpired ? <Outlet /> : <Navigate to="/signin" />
    )
}

export default PrivateRoutes