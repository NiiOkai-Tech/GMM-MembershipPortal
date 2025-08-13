// File: src/services/api.js
// Configures a centralized Axios instance for making API calls.
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.ghanamuslimmission.net/api",
  // baseURL: "http://localhost:9000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
