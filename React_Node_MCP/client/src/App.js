import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>MCP Calculator Client</h1>
        {!isOnline && (
          <div className="connection-warning">
            Your device is offline. WebSocket connections may not work.
          </div>
        )}
      </header>
      
      <main className="app-main">
        <Calculator />
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 MCP Calculator - A WebSocket Protocol Demo</p>
          <p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
