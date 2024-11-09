// src/components/RequestForm.js

import React, { useState } from 'react';
import { createRequest, updateRequestStatus } from '../services/requestService.js';
import RequestList from './RequestList.js';

function RequestForm({ user, onRequestSubmit, onAction, approvalRequests, userEmail }) {
  const [request, setRequest] = useState({
    title: '',
    description: '',
    type: '',
    urgency: '',
    googleId: '',
    supervisorEmail: '',
    userEmail: '',
    requestTypes: [
      { id: 1, type: 'Leave' },
      { id: 2, type: 'Equipment' },
      { id: 3, type: 'Overtime' },
    ],
  });

  const handleRequestChange = (e) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let requestData = { ...request, googleId: user.googleId, userEmail: user.email };
    await createRequest(user, requestData);
    onRequestSubmit();
    setRequest({ title: '', description: '', type: '', urgency: '', supervisorEmail: '', userEmail: '', googleId: '', requestTypes: [
          { id: 1, type: 'Leave' },
          { id: 2, type: 'Equipment' },
          { id: 3, type: 'Overtime' },], });
  };

  const handleApprove = async (requestId) => {
    await updateRequestStatus(requestId, 'Approved', userEmail);
    onAction();
  };

  const handleReject = async (requestId) => {
    await updateRequestStatus(requestId, 'Rejected', userEmail);
    onAction();
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
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
      <div className="approvalList">
      <h3>User Requests</h3>
      <ul>
        {approvalRequests.map((req) => (
          <RequestList key={req._id} request={req} onApprove={handleApprove} onReject={handleReject} />
        ))}
      </ul>
      </div>
    </div>
  );
}

export default RequestForm;
