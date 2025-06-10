import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Або кращий спінер
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Якщо ролі вказані, але поточна роль користувача не входить до них
        return <Navigate to="/" replace />; // Або на сторінку "Немає доступу"
    }

    return <Outlet />; // Дозволяє рендерити дочірні роути
};

export default ProtectedRoute;