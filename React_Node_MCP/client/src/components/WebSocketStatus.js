import React from 'react';
import './WebSocketStatus.css';

const WebSocketStatus = ({ isConnected, reconnect }) => {
  return (
    <div className="websocket-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {isConnected ? 'Connected to Server' : 'Disconnected from Server'}
        </span>
      </div>
      
      {!isConnected && (
        <button 
          className="reconnect-button" 
          onClick={reconnect}
          aria-label="Reconnect to server"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default WebSocketStatus;
