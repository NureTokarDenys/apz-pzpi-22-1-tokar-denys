import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Header.module.css';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <NavLink to="/" className={styles.brand}>
                <span className={styles.brandIcon}>🌿</span> 
                Greenhouse Control
            </NavLink>
            <ul className={styles.navLinks}>
                <li>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                        end 
                    >
                        Головна
                    </NavLink>
                </li>

                {currentUser ? (
                    <>
                        {currentUser.role === 'user' && (
                            <>
                                <li>
                                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                                        Мої Теплиці
                                    </NavLink>
                                </li>
                            </>
                        )}
                        {currentUser.role === 'admin' && (
                            <>
                                <li className={styles.dropdown}>
                                    <span className={styles.navLink}>Панель Адміністратора ▼</span>
                                    <ul className={styles.dropdownContent}>
                                        <li><NavLink to="/admin/users" className={styles.dropdownLink}>Користувачі</NavLink></li>
                                        <li><NavLink to="/admin/greenhouses" className={styles.dropdownLink}>Всі Теплиці</NavLink></li>
                                        <li><NavLink to="/admin/hardware-ids" className={styles.dropdownLink}>Hardware ID</NavLink></li>
                                    </ul>
                                </li>
                            </>
                        )}
                        <li>
                            <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
                                Вихід ({currentUser.username})
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                                Вхід
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/register" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                                Реєстрація
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Header;