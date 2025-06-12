import LoginForm from '../../components/Auth/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    return (
        <div className={styles.loginPageContainer}>
            <LoginForm />
        </div>
    );
};

export default LoginPage;