import axios from 'axios';

// Backend API базалық мекенжайы
export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});
