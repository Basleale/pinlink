import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; //maybe use DOTENV package here


// a lot simpler that doing it manually, just inject into every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if(token){
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default axios;