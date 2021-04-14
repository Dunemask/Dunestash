//Local Imports
import { constants } from "../api.json";
const jwtHeader = constants.jwtHeader;
const authToken = localStorage.getItem("authToken");
const defaultAxiosConfig = {
  headers: { "Content-Type": "application/json" },
};
defaultAxiosConfig.headers[jwtHeader] = authToken;
export default defaultAxiosConfig;
