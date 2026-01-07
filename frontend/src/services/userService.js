import api from './api';

const userService = {
    // 全ユーザー取得
    getAll: async () => {
        const response = await api.get('/api/users');
        return response.data;
    },

    // 特定ユーザー取得
    getById: async (id) => {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    },

    // ユーザー作成
    create: async (userData) => {
        const response = await api.post('/api/users', userData);
        return response.data;
    },

    // ユーザー更新
    update: async (id, userData) => {
        const response = await api.put(`/api/users/${id}`, userData);
        return response.data;
    },

    // ユーザー削除
    delete: async (id) => {
        await api.delete(`/api/users/${id}`);
    },
};

export default userService;