import api from './api';

const brandService = {
  getBrands: async (params = {}) => {
    try {
      const response = await api.get('/brands', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getBrand: async (id) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createBrand: async (brandData) => {
    try {
      const response = await api.post('/brands', brandData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateBrand: async (id, brandData) => {
    try {
      const response = await api.put(`/brands/${id}`, brandData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteBrand: async (id) => {
    try {
      const response = await api.delete(`/brands/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default brandService;
