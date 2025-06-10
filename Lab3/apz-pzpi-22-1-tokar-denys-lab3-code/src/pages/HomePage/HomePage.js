import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './HomePage.module.css';

const HomePage = () => {
    const { currentUser, logout } = useAuth();

    return (
        <div className={styles.homeContainer}>
            <h1>Welcome to the Autonomous Greenhouse System</h1>
            <p>Monitor and manage your greenhouses efficiently.</p>
            
            {currentUser ? (
                <div className={styles.userInfo}>
                    <p>Hello, {currentUser.username}! ({currentUser.role})</p>
                    <Link to="/dashboard" className={styles.dashboardLink}>Go to Dashboard</Link>
                    <button onClick={logout} className={styles.logoutButton}>Logout</button>
                </div>
            ) : (
                <div className={styles.authLinks}>
                    <Link to="/login" className={styles.link}>Login</Link>
                    <Link to="/register" className={styles.link}>Register</Link>
                </div>
            )}
            
            <div className={styles.features}>
                {/* Тут можна додати опис основних можливостей */}
                <div className={styles.feature}>
                    <h3>Real-time Monitoring</h3>
                    <p>Keep an eye on your greenhouse conditions anytime, anywhere.</p>
                </div>
                <div className={styles.feature}>
                    <h3>Automated Control</h3>
                    <p>Set up rules for automatic climate adjustments.</p>
                </div>
                <div className={styles.feature}>
                    <h3>Data Analytics</h3>
                    <p>Analyze historical data to optimize your growing strategies.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;