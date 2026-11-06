import api from './api';

export const chatService = {
  async getConversations() {
    const response = await api.get('/api/conversations');
    return response.data;
  },

  async getConversationById(id) {
    const response = await api.get(`/api/conversations/${id}`);
    return response.data;
  },

  async startDirectConversation(recipientId) {
    const response = await api.post('/api/conversations/direct', { recipientId });
    return response.data;
  },

  async createGroup(groupData) {
    const response = await api.post('/api/conversations/group', groupData);
    return response.data;
  },

  async updateGroup(id, groupData) {
    const response = await api.put(`/api/conversations/${id}`, groupData);
    return response.data;
  },

  async addGroupMembers(id, memberIds) {
    const response = await api.post(`/api/conversations/${id}/members`, { memberIds });
    return response.data;
  },

  async removeGroupMember(id, memberId) {
    const response = await api.delete(`/api/conversations/${id}/members/${memberId}`);
    return response.data;
  },

  async deleteConversation(id) {
    const response = await api.delete(`/api/conversations/${id}`);
    return response.data;
  },

  async getMessages(conversationId, page = 1, limit = 50) {
    const response = await api.get(`/api/messages/${conversationId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  },

  async editMessage(messageId, content) {
    const response = await api.put(`/api/messages/${messageId}`, { content });
    return response.data;
  },

  async deleteMessage(messageId, deleteForEveryone = false) {
    const response = await api.delete(`/api/messages/${messageId}?deleteForEveryone=${deleteForEveryone}`);
    return response.data;
  },

  async toggleReaction(messageId, emoji) {
    const response = await api.post(`/api/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },
};
