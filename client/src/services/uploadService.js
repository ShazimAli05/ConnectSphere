import api from './api';

export const uploadService = {
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },
};
