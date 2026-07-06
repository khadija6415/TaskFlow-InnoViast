import axiosInstance from "./axios";

export const getTasksApi = (params) => axiosInstance.get("/tasks", { params });
export const getTaskByIdApi = (id) => axiosInstance.get(`/tasks/${id}`);
export const createTaskApi = (data) => axiosInstance.post("/tasks", data);
export const updateTaskApi = (id, data) => axiosInstance.put(`/tasks/${id}`, data);
export const deleteTaskApi = (id) => axiosInstance.delete(`/tasks/${id}`);
export const addCommentApi = (id, text) => axiosInstance.post(`/tasks/${id}/comments`, { text });
export const getStatsApi = () => axiosInstance.get("/tasks/stats/summary");