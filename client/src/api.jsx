const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/'
  : 'https://moviemuseserver.vercel.app';
  

export default API_BASE_URL;