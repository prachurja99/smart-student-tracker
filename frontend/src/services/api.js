import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getGradesByStudent = (studentId) => API.get(`/grades/${studentId}`);
export const getGradeAnalytics = (studentId) => API.get(`/grades/analytics/${studentId}`);
export const createGrade = (data) => API.post('/grades', data);
export const updateGrade = (id, data) => API.put(`/grades/${id}`, data);
export const deleteGrade = (id) => API.delete(`/grades/${id}`);
export const getStudentAnalytics = (studentId) => API.get(`/grades/analytics/${studentId}`);
export const getPendingTeachers = () => API.get('/admin/pending-teachers');
export const approveTeacher = (id) => API.put(`/admin/approve-teacher/${id}`);
export const rejectTeacher = (id) => API.put(`/admin/reject-teacher/${id}`);
export const getAllUsers = () => API.get('/admin/all-users');
export const getAllStudents = () => API.get('/admin/all-students');
export const createSection = (data) => API.post('/sections', data);
export const getAllSections = () => API.get('/sections');
export const assignTeacherToSection = (sectionId, teacherId) => API.put(`/sections/${sectionId}/assign-teacher`, { teacherId });
export const assignStudentToSection = (sectionId, studentId) => API.post(`/sections/${sectionId}/assign-student`, { studentId });
export const removeStudentFromSection = (sectionId, studentId) => API.delete(`/sections/${sectionId}/remove-student/${studentId}`);
export const getMyStudents = () => API.get('/sections/my-students');
export const promoteToAdmin = (id) => API.put(`/admin/promote/${id}`);
export const getMySection = () => API.get('/sections/my-section');
export const getMLAnalysis = (studentId) => API.get(`/grades/ml-analysis/${studentId}`);
export const getMyMLAnalysis = () => API.get(`/grades/ml-analysis/me`);
export const sendChatMessage = (message, context) => API.post('/chat', { message, context });

export default API;