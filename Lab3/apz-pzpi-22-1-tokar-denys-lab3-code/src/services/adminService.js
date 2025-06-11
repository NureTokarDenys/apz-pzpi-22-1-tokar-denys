import axios from 'axios';
import authHeader from './authHeader';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// === User Management ===
const getAllUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/users`, { headers: authHeader() });
    return response.data;
};

const updateUserByAdmin = async (userId, userData) => {
    const response = await axios.patch(`${API_BASE_URL}/users/${userId}`, userData, { headers: authHeader() });
    return response.data;
};

const deleteUserByAdmin = async (userId) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, { headers: authHeader() });
    return response.data;
};

// === Greenhouse Management (Admin specific or all) ===
const getAllGreenhousesAdmin = async () => {
    const response = await axios.get(`${API_BASE_URL}/greenhouses`, { headers: authHeader() });
    return response.data;
};

const getGreenhouseByIdAdmin = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/greenhouses/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

const createGreenhouseAdmin = async (greenhouseData) => {
    const response = await axios.post(`${API_BASE_URL}/greenhouses`, greenhouseData, { headers: authHeader() });
    return response.data;
};

const updateGreenhouseAdmin = async (greenhouseId, greenhouseData) => {
    const response = await axios.patch(`${API_BASE_URL}/greenhouses/${greenhouseId}`, greenhouseData, { headers: authHeader() });
    return response.data;
};

const deleteGreenhouseAdmin = async (greenhouseId) => {
    const response = await axios.delete(`${API_BASE_URL}/greenhouses/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

// === Allowed Hardware IDs Management ===
const getAllowedHardwareIds = async () => {
    const response = await axios.get(`${API_BASE_URL}/allowed-hardware`, { headers: authHeader() });
    return response.data;
};

const addAllowedHardwareId = async (hardwareData) => {
    const response = await axios.post(`${API_BASE_URL}/allowed-hardware`, hardwareData, { headers: authHeader() });
    return response.data;
};

const updateAllowedHardwareId = async (entryId, hardwareData) => {
    const response = await axios.patch(`${API_BASE_URL}/allowed-hardware/${entryId}`, hardwareData, { headers: authHeader() });
    return response.data;
};

const deleteAllowedHardwareId = async (entryId) => {
    const response = await axios.delete(`${API_BASE_URL}/allowed-hardware/${entryId}`, { headers: authHeader() });
    return response.data;
};

// --- Нові функції для деталей теплиці ---
const getSensorsForGreenhouseAdmin = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/sensors/greenhouse/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

const getRulesForGreenhouseAdmin = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/rules/greenhouse/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

const getLogsForGreenhouseAdmin = async (greenhouseId, params = {}) => { // params можуть включати limit, page, etc.
    const response = await axios.get(`${API_BASE_URL}/logs/greenhouse/${greenhouseId}`, { headers: authHeader(), params });
    return response.data; // Припускаємо, що бекенд повертає масив логів
};

// === System Logs (Admin) ===
const getAllLogsAdmin = async () => {
    const response = await axios.get(`${API_BASE_URL}/logs`, { headers: authHeader() });
    return response.data;
};

// === Sensor Management (Admin for specific greenhouse) ===
const createSensorAdmin = async (sensorData) => { // sensorData: { type, greenhouseId, model, unit, status }
    const response = await axios.post(`${API_BASE_URL}/sensors`, sensorData, { headers: authHeader() });
    return response.data;
};

const updateSensorAdmin = async (sensorId, sensorData) => {
    const response = await axios.patch(`${API_BASE_URL}/sensors/${sensorId}`, sensorData, { headers: authHeader() });
    return response.data;
};

const deleteSensorAdmin = async (sensorId) => {
    const response = await axios.delete(`${API_BASE_URL}/sensors/${sensorId}`, { headers: authHeader() });
    return response.data;
};

// === Rule Management (Admin for specific greenhouse) ===
const createRuleAdmin = async (ruleData) => { // ruleData: { greenhouseId, condition, action, threshold, status }
    const response = await axios.post(`${API_BASE_URL}/rules`, ruleData, { headers: authHeader() });
    return response.data;
};

const updateRuleAdmin = async (ruleId, ruleData) => {
    const response = await axios.patch(`${API_BASE_URL}/rules/${ruleId}`, ruleData, { headers: authHeader() });
    return response.data;
};

const deleteRuleAdmin = async (ruleId) => {
    const response = await axios.delete(`${API_BASE_URL}/rules/${ruleId}`, { headers: authHeader() });
    return response.data;
};


const adminService = {
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,

    getAllGreenhousesAdmin,
    getGreenhouseByIdAdmin,
    createGreenhouseAdmin,
    updateGreenhouseAdmin,
    deleteGreenhouseAdmin,

    getAllowedHardwareIds,    
    addAllowedHardwareId,         
    updateAllowedHardwareId,    
    deleteAllowedHardwareId,       

    getSensorsForGreenhouseAdmin, 
    getRulesForGreenhouseAdmin,  
    getLogsForGreenhouseAdmin, 

    getAllLogsAdmin,

    createSensorAdmin,
    updateSensorAdmin,
    deleteSensorAdmin,

    createRuleAdmin,
    updateRuleAdmin,
    deleteRuleAdmin,
};

export default adminService;