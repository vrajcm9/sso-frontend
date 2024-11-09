// src/components/RequestList.js

import React from 'react';

function RequestList({ request }) {
  return (
    <li className="requestItem">
      <div className="requestItemDetails">
        <strong>{request.title}</strong> - {request.description} - {request.type} - {request.urgency} - {request.supervisorEmail} - {request.status}
      </div>
    </li>
  );
}

export default RequestList;
