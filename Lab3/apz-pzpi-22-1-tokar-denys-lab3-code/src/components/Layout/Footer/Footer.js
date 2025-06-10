import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <p>© {currentYear} Програмна Система Автономних Теплиць. Всі права захищені.</p>
        </footer>
    );
};

export default Footer;