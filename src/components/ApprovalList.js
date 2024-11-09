// src/components/RequestList.js

import React from 'react';

function ApprovalList({ request, onApprove, onReject }) {
  return (
    <li className="requestItem">
      <div className="requestItemDetails">
        <strong>{request.title}</strong> - {request.description} - {request.type} - {request.urgency} - {request.supervisorEmail} - {request.status}
      </div>
      <div>
        <button className="button button-approve" onClick={() => onApprove(request._id)}>Approve</button>
        <button className="button button-reject" onClick={() => onReject(request._id)}>Reject</button>
      </div>
    </li>
  );
}

export default ApprovalList;
