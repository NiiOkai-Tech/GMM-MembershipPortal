// File: src/services/api.js
// Configures a centralized Axios instance for making API calls.
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000/api", // Your backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
