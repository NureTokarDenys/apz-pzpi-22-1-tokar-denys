import axios from 'axios';
import authHeader from './authHeader';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// === Greenhouse Management for User ===
const getMyGreenhouses = async () => {
    const response = await axios.get(`${API_BASE_URL}/greenhouses`, { headers: authHeader() });
    return response.data;
};

const getMyGreenhouseById = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/greenhouses/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

const createMyGreenhouse = async (greenhouseData) => { // { name, location, hardwareId }
    const response = await axios.post(`${API_BASE_URL}/greenhouses`, greenhouseData, { headers: authHeader() });
    return response.data;
};

const updateMyGreenhouse = async (greenhouseId, greenhouseData) => { // { name, location } - hardwareId зазвичай не змінюється користувачем
    const response = await axios.patch(`${API_BASE_URL}/greenhouses/${greenhouseId}`, greenhouseData, { headers: authHeader() });
    return response.data;
};

const deleteMyGreenhouse = async (greenhouseId) => {
    const response = await axios.delete(`${API_BASE_URL}/greenhouses/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

// === Sensor Data for User's Greenhouse ===
const getSensorsForMyGreenhouse = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/sensors/greenhouse/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

// === Rule Management for User's Greenhouse ===
const getRulesForMyGreenhouse = async (greenhouseId) => {
    const response = await axios.get(`${API_BASE_URL}/rules/greenhouse/${greenhouseId}`, { headers: authHeader() });
    return response.data;
};

const createMyRule = async (ruleData) => { // { greenhouseId, threshold, action, status }
    const response = await axios.post(`${API_BASE_URL}/rules`, ruleData, { headers: authHeader() });
    return response.data;
};

const updateMyRule = async (ruleId, ruleData) => {
    const response = await axios.patch(`${API_BASE_URL}/rules/${ruleId}`, ruleData, { headers: authHeader() });
    return response.data;
};

const deleteMyRule = async (ruleId) => {
    const response = await axios.delete(`${API_BASE_URL}/rules/${ruleId}`, { headers: authHeader() });
    return response.data;
};

// === Log Data for User's Greenhouse ===
const getLogsForMyGreenhouse = async (greenhouseId, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/logs/greenhouse/${greenhouseId}`, { headers: authHeader(), params });
    return response.data;
};

const getAllowedHardwareIds = async () => {
    const response = await axios.get(`${API_BASE_URL}/allowed-hardware`, { headers: authHeader() });
    return response.data;
};

const getSensorDataHistory = async (sensorId, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/sensordata/sensor/${sensorId}`, { headers: authHeader(), params });
    return response.data; 
};

const greenhouseService = {
    getMyGreenhouses,
    getMyGreenhouseById,
    createMyGreenhouse,
    updateMyGreenhouse,
    deleteMyGreenhouse,
    getSensorsForMyGreenhouse,
    getRulesForMyGreenhouse,
    createMyRule,
    updateMyRule,
    deleteMyRule,
    getLogsForMyGreenhouse,
    getAllowedHardwareIds,
    getSensorDataHistory
};

export default greenhouseService;