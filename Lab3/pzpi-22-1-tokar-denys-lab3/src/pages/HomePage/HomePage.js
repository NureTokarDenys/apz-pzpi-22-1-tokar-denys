import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Додано useNavigate
import { useAuth } from '../../hooks/useAuth';
import styles from './HomePage.module.css';

const HomePage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate(); // Для перенаправлення

    const handleLogout = () => {
        logout();
        navigate('/'); // Перенаправлення на головну після виходу
    };

    return (
        <div className={styles.homeContainer}>
            <h1>Ласкаво просимо до Системи Автономних Теплиць</h1>
            <p>Ефективно відстежуйте та керуйте вашими теплицями.</p>
            
            {currentUser ? (
                <div className={styles.userInfo}>
                    <p>Вітаю, {currentUser.username}! (Роль: {currentUser.role === 'admin' ? 'Адміністратор' : 'Користувач'})</p>
                    {currentUser.role === 'user' && (
                        <Link to="/my-greenhouses" className={styles.dashboardLink}>Мої Теплиці</Link>
                    )}
                    {currentUser.role === 'admin' && (
                        <Link to="/admin/users" className={styles.dashboardLink}>Панель Адміністратора</Link>
                    )}
                    <button onClick={handleLogout} className={styles.logoutButton}>Вихід</button>
                </div>
            ) : (
                <div className={styles.authLinks}>
                    <Link to="/login" className={styles.link}>Вхід</Link>
                    <Link to="/register" className={styles.link}>Реєстрація</Link>
                </div>
            )}
            
            <div className={styles.features}>
                <div className={styles.feature}>
                    <h3>Моніторинг в Реальному Часі</h3>
                    <p>Слідкуйте за умовами у вашій теплиці будь-коли та будь-де.</p>
                </div>
                <div className={styles.feature}>
                    <h3>Автоматизоване Керування</h3>
                    <p>Налаштовуйте правила для автоматичного регулювання мікроклімату.</p>
                </div>
                <div className={styles.feature}>
                    <h3>Аналіз Даних</h3>
                    <p>Аналізуйте історичні дані для оптимізації стратегій вирощування.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;