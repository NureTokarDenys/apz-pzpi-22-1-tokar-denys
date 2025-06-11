import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + "/users" || 'http://localhost:5000/api/users';

const register = async (username, email, password, role) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password,
            role
        });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password,
        });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;