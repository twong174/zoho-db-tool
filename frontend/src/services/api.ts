import axios from "axios"

const API_BASE_URL = "http://localhost:4000";

export const api = { 
  getZohoContacts: () => axios.get(`${API_BASE_URL}/zoho-contacts`),
  updateZohoContact: (email: string, data: any) =>
    axios.put(`${API_BASE_URL}/zoho-contacts/${encodeURIComponent(email)}`, data),
  createZohoContact: (data: any) =>
    axios.post(`${API_BASE_URL}/zoho-contacts`, data),

  getConstantContacts: () => axios.get(`${API_BASE_URL}/constant-contacts`),
}