// store/authstore.js
import { create } from 'zustand';

const useStore = create((set) => ({
  token: null,
  userId: null,
  
  // Add initialize function to load from localStorage
  initialize: () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      set({ token, userId });
    }
  },
  
  // Make sure your login function stores in localStorage
  login: (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    set({ token, userId });
  },
  
  // Make sure logout clears localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    set({ token: null, userId: null });
  }
}));

export default useStore;