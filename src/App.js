// src/App.js

import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserHeader from './components/UserHeader';
import ApprovalForm from './components/ApprovalForm';
import RequestForm from './components/RequestForm';
import { sendMail } from './services/notificationService'
import { fetchUser } from './services/authService';
import {fetchRequests, fetchApprovalRequests } from './services/requestService';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);

  const emailSent = useRef(false); // Track if the email has been sent
  // const loggedIn = useRef(false);

  // Fetch user only once when the component mounts
  useEffect(() => {
    const initUser = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        let userId = urlParams.get('userId');

        if (userId) userId = userId.replace(/^"(.+(?="$))"$/, '$1');

        if (token && userId) {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
          window.history.replaceState({}, '', `${window.location.pathname}`);
        }

        const userData = await fetchUser();
        
        if (userData) {
          setUser(userData);
        }
      
    };
    initUser();
  }, []);

  // Load requests whenever the user logs in or email changes
  useEffect(() => {
    if (user && user.email) {
      loadRequests(user.email);
    }
  }, [user]);

  // Send email only once after user is logged in and data is set
  useEffect(() => {
    const sendLoginEmail = async () => {
      if (emailSent.current || !user) return;
      emailSent.current = true;
      await sendMail(user.email, "SSOApp - Login Notification", "Login testing");
    };
    sendLoginEmail();
  }, [user, emailSent]);

  const loadRequests = async (email) => {
    const userRequests = await fetchRequests();
    const approvals = await fetchApprovalRequests(email);
    setRequests(userRequests);
    setApprovalRequests(approvals);
    
  };

  const handleGoogleLogin = () => {
    window.location.href = REACT_APP_BACKEND_URL+'/api/auth/google';
  };

  return (
    <div className="appContainer">
      <h1 className="header">Request Management System</h1>
      {user ? (
        <>
          <UserHeader user={user} onLogout={() => setUser(null)} />
          <RequestForm user={user} onRequestSubmit={() => loadRequests(user.email)} approvalRequests={requests} onAction={loadRequests} userEmail={user.email} />
          <ApprovalForm approvalRequests={approvalRequests} onAction={() => loadRequests(user.email)} userEmail={user.email} />
        </>
      ) : (
        <div>Please log in to view your requests.
        
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleLogin} onFailure={(response) => console.error(response)} />
          </GoogleOAuthProvider>
        </div>
        
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
