import {Message} from 'element-ui';
import axios from "axios";
import router from "../../router";
// 添加请求拦截器

let httpApi = axios.create({
  baseURL: "/api",
  timeout: 5000
});
httpApi.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
httpApi.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  // if (response.data.code === 401) {
  //   Message.error(response.data.message);
  //   router.replace({path: "/"});
  // } else if (response.data.code === 500) {
  //   Message.error(response.data.message);
  // }
  return response.data;
}, function (error) {
  // 对响应错误做点什么
  Message.error('服务器请求超时...');
  return Promise.reject(error);
});
export default httpApi;

