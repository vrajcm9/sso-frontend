import axios from 'axios';

export const sendMail = async (to, subject, text) => {
    try {
      await axios.post(process.env.REACT_APP_BACKEND_URL+'/api/notifications', { to, subject, text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error('Error sending mail:', err.message);
    }
  };