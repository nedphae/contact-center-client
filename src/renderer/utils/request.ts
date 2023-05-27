import axios from 'axios';
import { getTokenSource } from 'renderer/electron/jwtStorage';
import tokenConfig from 'renderer/config/clientConfig';

const axiosInstance = axios.create({
  baseURL: tokenConfig.web.host, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // do something before request is sent
    const acessToken = await getTokenSource();

    if (acessToken) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers.Authorization = `Bearer ${acessToken}`;
    }
    return config;
  },
  (error) => {
    // do something with request error
    // console.error(error); // for debug
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.error(error); // for debug
    return Promise.reject(error);
  }
);

export default axiosInstance;

const kinbanaAxiosInstance = axios.create({
  // baseURL: tokenConfig.web.host, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
});

kinbanaAxiosInstance.interceptors.request.use(
  async (config) => {
    // do something before request is sent
    const acessToken = await getTokenSource();

    if (acessToken) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers.Authorization = `Bearer ${acessToken}`;
    }
    return config;
  },
  (error) => {
    // do something with request error
    // console.error(error); // for debug
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.error(error); // for debug
    return Promise.reject(error);
  }
);

export const kinbanaAxios = kinbanaAxiosInstance;
