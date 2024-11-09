import axios from 'axios';
import { sendMail } from './notificationService';

export const fetchUser = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await axios.get('http://localhost:4000/api/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
        params: { userId },
      });
      return res.data;
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

export const userLogout = async (user, onLogout) => {
    await sendMail(user.email, "Logout Notification", "User has logged out");
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    await axios.get('http://localhost:4000/api/auth/logout');
    onLogout();
};
