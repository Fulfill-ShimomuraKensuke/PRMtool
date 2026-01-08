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
  const exp = payload?.exp;
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

const authService = {
  // ログイン（loginIdに変更）
  login: async (loginId, password) => {
    const response = await api.post('/api/auth/login', {
      loginId,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);

      // 🔧 userオブジェクトを整形してから保存
      const user = {
        id: response.data.userId,        // 🆕 id プロパティを追加
        userId: response.data.userId,    // 互換性のため残す
        email: response.data.email,
        role: response.data.role,
        name: response.data.name,
        loginId: response.data.loginId
      };

      localStorage.setItem('user', JSON.stringify(user));
      return user;  // 🔧 整形したuserを返す
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
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    // 🔧 古いデータとの互換性のため、idがない場合は追加
    if (user && !user.id && user.userId) {
      user.id = user.userId;
      // 更新して保存し直す
      localStorage.setItem('user', JSON.stringify(user));
    }

    return user;
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