import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [user, setUser] = useState(() => {
  try {
   const stored = localStorage.getItem('user');
   return stored ? JSON.parse(stored) : null;
  } catch {
   return null;
  }
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
   setLoading(false);
   return;
  }

  api.get('/auth/me')
   .then((res) => {
    setUser(res.data.data);
    localStorage.setItem('user', JSON.stringify(res.data.data));
   })
   .catch(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
   })
   .finally(() => setLoading(false));
 }, []);

 const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  const { token, user: userData } = res.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
  return userData;
 };

 const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
 };

 return (
  <AuthContext.Provider value={{ user, loading, login, logout }}>
   {children}
  </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) throw new Error('useAuth must be used within AuthProvider');
 return context;
}
