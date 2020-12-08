import axios from 'axios';
import { getToken } from '../electron/jwtStorage';

const axiosInstance = axios.create({
  baseURL: process.env.APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // do something before request is sent
    const token = await getToken();
    if (token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

export default axiosInstance;
