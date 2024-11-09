// src/components/ApprovalForm.js

import React from 'react';
import ApprovalList from './ApprovalList';
import { updateRequestStatus } from '../services/requestService';

function ApprovalForm({ approvalRequests, onAction, userEmail }) {
  const handleApprove = async (requestId) => {
    await updateRequestStatus(requestId, 'Approved', userEmail);
    onAction();
  };

  const handleReject = async (requestId) => {
    await updateRequestStatus(requestId, 'Rejected', userEmail);
    onAction();
  };

  return (
    <div className="approvalList">
      <h3>Approval Requests</h3>
      <ul>
        {approvalRequests.map((req) => (
          <ApprovalList key={req._id} request={req} onApprove={handleApprove} onReject={handleReject} />
        ))}
      </ul>
    </div>
  );
}

export default ApprovalForm;
