
import axios from "axios";


const api = axios.create({
  baseURL: window._env_?.REACT_APP_API_BASE_URL
});

export default api;
