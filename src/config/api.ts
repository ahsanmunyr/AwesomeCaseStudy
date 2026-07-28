import axios, { AxiosInstance } from "axios";
import Config from "react-native-config";
import APIS from "./baseURLs";

export const REQUEST_TIMEOUT_MS = 15000; // this value should be coming from the cms or server, we can handle it when App live

export function createAjaxInstance(): AxiosInstance {
  return axios.create({
    baseURL: APIS.GET_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "content-type": "application/json",
      "x-rapidapi-key": Config.RAPID_API_KEY ?? "",
      "x-rapidapi-host": "hearthstone11.p.rapidapi.com",
    },
  });
}

export default createAjaxInstance;
