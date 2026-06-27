import React, { createContext, useState, useEffect, useContext } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('insta_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Refresh user details from DB to stay updated
        userAPI.getById(parsed.id)
          .then(user => {
            setCurrentUser(user);
            localStorage.setItem('insta_user', JSON.stringify(user));
            setLoading(false);
          })
          .catch(() => {
            // Fallback to stored user if server is offline
            setCurrentUser(parsed);
            setLoading(false);
          });
      } catch (e) {
        localStorage.removeItem('insta_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const users = await userAPI.getAll();
      const user = users.find(
        u => (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
              u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
             u.password === password
      );

      if (!user) {
        throw new Error('Invalid username/email or password');
      }

      setCurrentUser(user);
      localStorage.setItem('insta_user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username, name, email, password) => {
    try {
      const users = await userAPI.getAll();
      const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (usernameExists) {
        throw new Error('Username is already taken');
      }
      if (emailExists) {
        throw new Error('Email is already registered');
      }

      const randomImgId = Math.floor(Math.random() * 70) + 1;
      const newUser = {
        username: username.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        profilePic: `https://i.pravatar.cc/150?img=${randomImgId}`,
        bio: 'Hello! I am new to Instagram.',
        website: ''
      };

      const created = await userAPI.create(newUser);
      setCurrentUser(created);
      localStorage.setItem('insta_user', JSON.stringify(created));
      return created;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('insta_user');
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser) return;
    try {
      // Validate unique username if changed
      if (updatedData.username && updatedData.username !== currentUser.username) {
        const users = await userAPI.getAll();
        const usernameExists = users.some(
          u => u.username.toLowerCase() === updatedData.username.toLowerCase() && u.id !== currentUser.id
        );
        if (usernameExists) {
          throw new Error('Username is already taken');
        }
      }

      const updated = await userAPI.update(currentUser.id, updatedData);
      setCurrentUser(updated);
      localStorage.setItem('insta_user', JSON.stringify(updated));
      return updated;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
