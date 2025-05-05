import axios from 'axios';

const alma = axios.create({
  baseURL: import.meta.env.VITE_ALMA_API_URL,
  headers: {
    'Authorization': import.meta.env.VITE_ALMA_API_TOKEN,
    'API_KEY': import.meta.env.VITE_ALMA_API_TOKEN,
    'Content-Type': 'multipart/form-data',
  },
  // No incluimos withCredentials ya que Alma usa token de autorización
  withCredentials: false
});

export default alma;