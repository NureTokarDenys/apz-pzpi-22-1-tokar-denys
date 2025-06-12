import React from 'react';
import RegisterForm from '../../components/Auth/RegisterForm'; // Правильний шлях
import styles from './RegisterPage.module.css'; // Створіть цей файл

const RegisterPage = () => {
    return (
        <div className={styles.registerPageContainer}>
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;