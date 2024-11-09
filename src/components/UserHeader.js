// src/components/UserHeader.js

import React from 'react';
import { userLogout } from '../services/authService.js';

function UserHeader({ user, onLogout }) {

  return (
    <div>
      <span>Welcome, {user.displayName}</span>
      <button className="button button-logout" onClick={()=> userLogout(user, onLogout)}>Logout</button>
    </div>
  );
}

export default UserHeader;
