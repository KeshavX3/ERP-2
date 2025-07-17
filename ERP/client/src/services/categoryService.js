import api from './api';

const categoryService = {
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default categoryService;
