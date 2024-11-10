import axios from 'axios';
import { sendMail } from './notificationService';
import { fetchUser } from './authService';

export const createRequest = async (user, request) => {
    try {
      const response = await axios.post(process.env.REACT_APP_BACKEND_URL+'/api/requests', request, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(response);
      await sendMail(user.email, "SSOApp - Request Creation", "Request created, please wait for approval.");
      await sendMail(request.supervisorEmail, "SSOApp - Request Creation", "New request created by " + user.displayName + ", please check.");
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  export const fetchRequests = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(process.env.REACT_APP_BACKEND_URL+'/api/requests/userRequests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { userId },
      });
      return res.data;
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  export const fetchApprovalRequests = async (email) => {
    try {
      const res = await axios.get(process.env.REACT_APP_BACKEND_URL+'/api/requests/approvalRequests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { email },
      });
      return res.data;
    } catch (err) {
      console.error('Error fetching approval requests:', err);
    }
  };

  export const fetchAllData = async () => {
    try {
      const userData = await fetchUser();
      await fetchRequests();
      await fetchApprovalRequests(userData.email);
        await sendMail(userData.email, "SSOApp - Login Notification", "Login testing");
        
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  export const updateRequestStatus = async (requestId, status, userMail) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/approvalRequests`, { status: status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { requestId, status: status },
      });
      await sendMail(userMail, "SSOApp - Request "+ status, "You have " + status + " the request with requestid: " + response.data._id);
      await sendMail(response.data.userEmail, "SSOApp - Request " + status, "Your request has been " + status + " with requestid: " + response.data._id);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };
