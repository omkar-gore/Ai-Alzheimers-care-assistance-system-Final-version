import axios from './axios';

/**
 * Early Cognitive Screening API Service
 */

export const submitScreening = async (screeningData) => {
  const response = await axios.post('/screening', screeningData);
  return response.data;
};

export const getScreeningHistory = async () => {
  const response = await axios.get('/screening/history');
  return response.data;
};

export const getScreeningById = async (id) => {
  const response = await axios.get(`/screening/${id}`);
  return response.data;
};

export const registerScreeningUser = async (registrationData) => {
  const response = await axios.post('/screening/register', registrationData);
  return response.data;
};

export const linkScreening = async (screeningId) => {
  const response = await axios.post(`/screening/link/${screeningId}`);
  return response.data;
};

export default {
  submitScreening,
  getScreeningHistory,
  getScreeningById,
  registerScreeningUser,
  linkScreening,
};
