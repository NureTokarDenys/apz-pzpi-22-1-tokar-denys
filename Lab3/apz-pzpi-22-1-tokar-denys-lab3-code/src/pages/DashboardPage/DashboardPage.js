import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './DashboardPage.module.css'; // Створіть цей файл

const DashboardPage = () => {
    const { currentUser, logout } = useAuth();

    if (!currentUser) {
        // Теоретично сюди не маємо потрапити, якщо ProtectedRoute працює
        return <p>Loading user data or not authenticated...</p>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <h2>Dashboard</h2>
            <p>Welcome, {currentUser.username}!</p>
            <p>Your role: {currentUser.role}</p>
            {/* Тут буде основний контент дашборду */}
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default DashboardPage;