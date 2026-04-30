import api from './api';

export const getUsers    = ()           => api.get('/users');
export const getUserById = (id)         => api.get(`/users/${id}`);
export const createUser  = (data)       => api.post('/users/register', data); // ← /register
export const loginUser   = (data)       => api.post('/users/login', data);    // ← novo
export const updateUser  = (id, data)   => api.put(`/users/${id}`, data);
export const deleteUser  = (id)         => api.delete(`/users/${id}`);