import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.127.1:5000/api", // change YOUR_IP
});

export default API;
