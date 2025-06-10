import axios from 'axios';
import authHeader from './authHeader';

const API_URL_ADMIN_USERS = process.env.BACKEND_HOST + '/api/users';
alert(API_URL_ADMIN_USERS);
const getAllUsers = async () => {
    const response = await axios.get(API_URL_ADMIN_USERS, { headers: authHeader() });
    return response.data;
};

const updateUserByAdmin = async (userId, userData) => {
    const response = await axios.patch(`${API_URL_ADMIN_USERS}/${userId}`, userData, { headers: authHeader() });
    return response.data;
};

const deleteUserByAdmin = async (userId) => {
    const response = await axios.delete(`${API_URL_ADMIN_USERS}/${userId}`, { headers: authHeader() });
    return response.data;
};



const adminService = {
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
};

export default adminService;