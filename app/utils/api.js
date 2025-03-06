import axios from 'axios';

const API = axios.create({
  baseURL: 'https://clinic-backend-f42a.onrender.com', // Your backend URL
  withCredentials: true, // Include cookies
});

export default API;
