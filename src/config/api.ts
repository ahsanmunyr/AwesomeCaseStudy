import axios, { AxiosInstance } from "axios";
import Config from "react-native-config";
import { API } from "./baseURLs";

// Give up on a request after 15 seconds. should be coming from cms
export const REQUEST_TIMEOUT_MS = 15000;

export function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: API.BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "content-type": "application/json",
      "x-rapidapi-key": Config.RAPID_API_KEY ?? "",
      "x-rapidapi-host": "hearthstone11.p.rapidapi.com",
    },
  });
}

export default createApiClient;
