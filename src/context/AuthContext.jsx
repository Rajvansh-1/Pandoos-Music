import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pandoos_user');
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem('pandoos_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safe } = found;
    localStorage.setItem('pandoos_user', JSON.stringify(safe));
    setUser(safe);
    return safe;
  }, []);

  const signup = useCallback((name, email, password) => {
    const users = JSON.parse(localStorage.getItem('pandoos_users') || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    const newUser = { id: Date.now().toString(), name, email, password, avatar: '🐼', createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('pandoos_users', JSON.stringify(users));
    const { password: _, ...safe } = newUser;
    localStorage.setItem('pandoos_user', JSON.stringify(safe));
    setUser(safe);
    return safe;
  }, []);

  const googleLogin = useCallback(() => {
    const mockUser = { id: 'google_' + Date.now(), name: 'Panda Fan', email: 'pandafan@gmail.com', avatar: '🐼', provider: 'google', createdAt: new Date().toISOString() };
    localStorage.setItem('pandoos_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pandoos_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
