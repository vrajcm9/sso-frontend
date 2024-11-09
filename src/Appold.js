import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; // Import the new CSS file

function App() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [request, setRequest] = useState({
    title: '',
    description: '',
    type: '',
    urgency: '',
    supervisorEmail: '',
    googleId: '',
    userEmail: '',
    requestTypes: [
      { id: 1, type: 'Leave' },
      { id: 2, type: 'Equipment' },
      { id: 3, type: 'Overtime' },
    ],
  });
  const [approvalRequests, setApprovalRequests] = useState([]);

  const loggedInRef = useRef(false);
  const fetchAllDataCalledRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let userId = urlParams.get('userId');

    if (userId) userId = userId.replace(/^"(.+(?="$))"$/, '$1');
    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      window.history.replaceState({}, '', `${window.location.pathname}`);
    }
    if (localStorage.getItem('token') && localStorage.getItem('userId')) fetchAllData();
    else console.log("No token or userId found. Redirecting to login.");
  }, []);

  const fetchUser = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await axios.get('http://localhost:4000/api/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
        params: { userId },
      });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get('http://localhost:4000/api/requests/userRequests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { userId },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchApprovalRequests = async (email) => {
    try {
      const res = await axios.get('http://localhost:4000/api/requests/approvalRequests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { email },
      });
      setApprovalRequests(res.data);
    } catch (err) {
      console.error('Error fetching approval requests:', err);
    }
  };

  const fetchAllData = async () => {
    if (fetchAllDataCalledRef.current) return;
    fetchAllDataCalledRef.current = true;
    try {
      const userData = await fetchUser();
      await fetchRequests();
      await fetchApprovalRequests(userData.email);
      if (!loggedInRef.current) {
        await sendMail(userData.email, "SSOApp - Login Notification", "Login testing");
        loggedInRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
  };

  const sendMail = async (to, subject, text) => {
    try {
      const response = await axios.post('http://localhost:4000/api/notifications', { to, subject, text }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Mail sent successfully:', response.data);
    } catch (err) {
      console.error('Error sending mail:', err.message);
    }
  };

  const handleLogout = async () => {
    await sendMail(user.email, "SSOApp - Logout Notification", "Logout testing");
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    await axios.get('http://localhost:4000/api/auth/logout');
  };

  const handleRequestChange = (e) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const requestData = { ...request, googleId: user.googleId, userEmail: user.email };
      await axios.post('http://localhost:4000/api/requests', requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await sendMail(user.email, "SSOApp - Request Creation", "Request created, please wait for approval.");
      await sendMail(requestData.supervisorEmail, "SSOApp - Request Creation", "New request created by " + user.displayName + ", please check.");
      fetchRequests();
      setRequest({
        title: '',
        description: '',
        type: '',
        urgency: '',
        supervisorEmail: '',
        googleId: '',
        userEmail: '',
        requestTypes: [
          { id: 1, type: 'Leave' },
          { id: 2, type: 'Equipment' },
          { id: 3, type: 'Overtime' },
        ],
      });
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/requests/approvalRequests`, { status: 'Approved' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { requestId, status: 'Approved' },
      });
      fetchApprovalRequests(user.email);
      await sendMail(user.email, "SSOApp - Request Approved", "You have approved the request with requestid: " + response.data._id);
      await sendMail(response.data.userEmail, "SSOApp - Request Approved", "Your request has been approved with requestid: " + response.data._id);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/requests/approvalRequests`, { status: 'Rejected' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { requestId, status: 'Rejected' },
      });
      fetchApprovalRequests(user.email);
      await sendMail(user.email, "SSOApp - Request Rejected", "You have rejected the request with requestid: " + response.data._id);
      await sendMail(response.data.userEmail, "SSOApp - Request Rejected", "Your request has been rejected with requestid: " + response.data._id);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="appContainer">
      <h1 className="header">Request Management System</h1>
      {user ? (
        <div>
          <button className="button button-logout" onClick={handleLogout}>Logout</button>
          <h3>Requests</h3>
          <form className="form" onSubmit={handleSubmitRequest}>
            <input type="text" name="title" placeholder="Title" value={request.title} onChange={handleRequestChange} className="input" required />
            <input type="text" name="description" placeholder="Description" value={request.description} onChange={handleRequestChange} className="input" required />
            <select value={request.type} name="type" onChange={handleRequestChange} className="select">
              <option value="">--Select--</option>
              {request.requestTypes.map((item) => (
                <option key={item.id} value={item.type}>{item.type}</option>
              ))}
            </select>
            <input type="text" name="urgency" placeholder="Urgency" value={request.urgency} onChange={handleRequestChange} className="input" required />
            <input type="text" name="supervisorEmail" placeholder="Supervisor Email" value={request.supervisorEmail} onChange={handleRequestChange} className="input" required />
            <button className="button button-create" type="submit">Create Request</button>
          </form>
          <ul>
            {requests.map((req) => (
              <li className="requestItem" key={req._id}>
                <div className="requestItemDetails">
                  <strong>{req.title}</strong> - {req.description} - {req.type} - {req.supervisorEmail} - {req.urgency} - {req.status}
                </div>
              </li>
            ))}
          </ul>
          <div className="approvalList">
            <h3>Approval Lists</h3>
            <ul>
              {approvalRequests.map((req) => (
                <li className="requestItem" key={req._id}>
                  <div className="requestItemDetails">
                    <strong>{req.title}</strong> - {req.description} - {req.type} - {req.supervisorEmail} - {req.urgency} - {req.status}
                  </div>
                  <div>
                    <button className="button button-approve" onClick={() => handleApprove(req._id)}>Approve</button>
                    <button className="button button-reject" onClick={() => handleReject(req._id)}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <GoogleLogin onSuccess={handleGoogleLogin} onFailure={(response) => console.error(response)} />
        </GoogleOAuthProvider>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  );
}
