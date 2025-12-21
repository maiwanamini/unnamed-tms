import { API_URL } from "../constants/Api";

export const api = {
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/register`,

  users: `${API_URL}/users`,
  orders: `${API_URL}/orders`,
  stops: `${API_URL}/stops`,
  companies: `${API_URL}/companies`,
  trucks: `${API_URL}/trucks`,
};
