/**
 * WebSocket server for MCP Calculator
 * Implements an Express server with WebSocket support for calculator operations
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const calculator = require('../tools/calculator');

// Create Express application
const app = express();
const PORT = process.env.PORT || 8081;

// Add CORS support for development
app.use(cors());

// Serve a basic status page
app.get('/', (req, res) => {
  res.send('MCP Calculator WebSocket Server is running');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Client tracking
const clients = new Set();

/**
 * Process an incoming calculator message
 * @param {Object} message - The parsed message object
 * @returns {Object} - Response object with status and result
 */
function processMessage(message) {
  try {
    // Validate message structure
    if (!message || typeof message !== 'object') {
      return { status: 'error', result: 'Invalid message format: Expected JSON object' };
    }

    const { operation, operands } = message;

    // Validate required fields
    if (!operation || !operands) {
      return { status: 'error', result: 'Invalid message format: Missing required fields' };
    }

    // Route to appropriate calculator function
    let result;
    switch (operation) {
      case 'sum':
        result = calculator.sum(operands);
        break;
      case 'subtract':
        result = calculator.subtract(operands);
        break;
      case 'multiply':
        result = calculator.multiply(operands);
        break;
      case 'divide':
        result = calculator.divide(operands);
        break;
      case 'percentage':
        result = calculator.percentage(operands);
        break;
      default:
        return { status: 'error', result: `Unknown operation: ${operation}` };
    }

    return { status: 'success', result };
  } catch (error) {
    return { status: 'error', result: error.message };
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  const clientId = Date.now();
  console.log(`Client connected: ${clientId}`);
  
  // Add to client set
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    status: 'info',
    result: 'Connected to MCP Calculator WebSocket Server'
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    console.log(`Received message: ${data}`);
    
    try {
      const message = JSON.parse(data);
      const response = processMessage(message);
      
      // Send response back to client
      ws.send(JSON.stringify(response));
    } catch (error) {
      // Handle JSON parsing errors
      ws.send(JSON.stringify({ 
        status: 'error', 
        result: 'Invalid JSON format' 
      }));
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
    clients.delete(ws);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`MCP Calculator WebSocket Server running on port ${PORT}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port by setting the PORT environment variable.`);
    console.error(`Example: PORT=8082 node src/websocket-server.js`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  
  // Close all client connections
  for (const client of clients) {
    client.terminate();
  }
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

