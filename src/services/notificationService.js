import axios from 'axios';

export const sendMail = async (to, subject, text) => {
    try {
      await axios.post('http://localhost:4000/api/notifications', { to, subject, text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error('Error sending mail:', err.message);
    }
  };