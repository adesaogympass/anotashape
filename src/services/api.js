import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configura a URL base
axios.defaults.baseURL = API_URL;

// Interceptor para adicionar token em todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== WORKOUTS ====================

export const workoutService = {
  getAll: () => axios.get('/workouts'),
  getById: (id) => axios.get(`/workouts/${id}`),
  getToday: () => axios.get('/workouts/today'),
  create: (data) => axios.post('/workouts', data),
  update: (id, data) => axios.put(`/workouts/${id}`, data),
  delete: (id) => axios.delete(`/workouts/${id}`),
};

// ==================== EXERCISES ====================

export const exerciseService = {
  getByWorkout: (workoutId) => axios.get(`/exercises/workout/${workoutId}`),
  create: (data) => axios.post('/exercises', data),
  update: (id, data) => axios.put(`/exercises/${id}`, data),
  delete: (id) => axios.delete(`/exercises/${id}`),
};

// ==================== HISTORY ====================

export const historyService = {
  getAll: (params) => axios.get('/history', { params }),
  getExerciseHistory: (exerciseId) => axios.get(`/history/exercise/${exerciseId}`),
  getStats: () => axios.get('/history/stats'),
  create: (data) => axios.post('/history', data),
};

// ==================== PROFILE ====================

export const profileService = {
  getProfile: () => axios.get('/auth/profile'),
  updateProfile: (data) => axios.put('/auth/profile', data),
  updatePassword: (data) => axios.put('/auth/password', data),
};

// ==================== UPLOAD ====================

export const uploadService = {
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ==================== ACHIEVEMENTS ====================

export const achievementsService = {
  getAll: () => axios.get('/achievements'),
  getUserAchievements: () => axios.get('/achievements/user'),
  getProgress: () => axios.get('/achievements/progress'),
};

// ==================== ACTIVITY ====================

export const activityService = {
  getDailyActivity: () => axios.get('/activity/daily'),
  updateGoals: (data) => axios.put('/activity/goals', data),
  getActivityHistory: (days = 30) => axios.get('/activity/history', { params: { days } }),
};

export default axios;
