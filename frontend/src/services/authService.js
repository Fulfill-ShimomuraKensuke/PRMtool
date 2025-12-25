import api from './api';

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp; // 秒
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

const authService = {
  // ユーザー登録
  register: async (email, password, role) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      role,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // ログイン
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // ログアウト
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 現在のユーザーを取得
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // トークンを取得
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ログイン状態を確認
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !isTokenExpired(token);
  },

  // トークンの有効期限を確認
  isTokenExpired: () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    return isTokenExpired(token);
  },
};

export default authService;