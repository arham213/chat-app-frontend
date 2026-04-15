import axios from "axios";

const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/api`,
    withCredentials: true,
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
)

export default apiClient;