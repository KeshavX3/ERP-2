import api from './api';

const uploadService = {
  uploadImage: async (file) => {
    console.log('uploadService.uploadImage called with file:', file);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }
    
    const formData = new FormData();
    formData.append('image', file);

    console.log('FormData created, making API call...');

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload API response:', response);
      
      // The response interceptor in api.js returns response.data directly
      // So 'response' here is actually the data object
      if (!response || !response.imagePath) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure from server');
      }
      
      return response;
    } catch (error) {
      console.error('Upload API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response; // api.js interceptor returns response.data directly
    } catch (error) {
      throw error;
    }
  }
};

export default uploadService;
