import React, { useState, useEffect, useCallback } from 'react';
import WebSocketStatus from './WebSocketStatus';
import DisplayScreen from './DisplayScreen';
import OperationPanel from './OperationPanel';
import './Calculator.css';

// WebSocket server URL
const WS_URL = 'ws://localhost:8081';

const Calculator = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [currentOperands, setCurrentOperands] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Create and connect WebSocket
  const connectWebSocket = useCallback(() => {
    setError(null);
    console.log('Attempting to connect to WebSocket server...');
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to WebSocket server');
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
      console.log(`Disconnected from WebSocket server: ${event.code} ${event.reason}`);
      if (!event.wasClean) {
        setError('Connection closed unexpectedly');
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to server. Make sure the server is running.');
      setIsConnected(false);
    };
    
    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received response:', response);
        
        setIsCalculating(false);
        
        if (response.status === 'error') {
          setError(response.result);
          setResult(null);
        } else if (response.status === 'success') {
          setResult(response.result);
          setError(null);
        } else if (response.status === 'info') {
          console.log('Info:', response.result);
        }
      } catch (err) {
        console.error('Error parsing response:', err);
        setError('Invalid response from server');
        setIsCalculating(false);
      }
    };
    
    setSocket(ws);
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Connect on component mount
  useEffect(() => {
    const cleanup = connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [connectWebSocket]);

  // Perform calculation
  const performOperation = (operation, operands) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Not connected to server');
      return;
    }
    
    if (!operands || operands.length === 0) {
      setError('No operands provided');
      return;
    }
    
    const message = {
      operation,
      operands
    };
    
    setCurrentOperation(operation);
    setCurrentOperands(operands);
    setError(null);
    setResult(null);
    setIsCalculating(true);
    
    try {
      socket.send(JSON.stringify(message));
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send request to server');
      setIsCalculating(false);
    }
  };

  return (
    <div className="calculator">
      <h1>MCP Calculator</h1>
      
      <WebSocketStatus 
        isConnected={isConnected}
        reconnect={connectWebSocket}
      />
      
      <DisplayScreen 
        result={result}
        error={error}
        operation={currentOperation}
        operands={currentOperands}
        isCalculating={isCalculating}
      />
      
      <OperationPanel 
        performOperation={performOperation}
        isCalculating={isCalculating}
        isConnected={isConnected}
      />
      
      <div className="calculator-footer">
        <p>Model Context Protocol Calculator</p>
        <p>WebSocket connection to MCP Server</p>
      </div>
    </div>
  );
};

export default Calculator;
