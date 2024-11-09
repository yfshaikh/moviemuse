const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/'
  : 'https://yfshaikh.com/api';
  

export default API_BASE_URL;