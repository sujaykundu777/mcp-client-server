/**
 * MCP Server implementation for calculator operations
 * Implements a TCP server that accepts calculator operation requests
 */

const net = require('net');
const calculator = require('../tools/calculator');

// Default port for the server
const PORT = 3000;

// Track active connections
const activeConnections = new Map();

/**
 * Process an incoming message and execute the requested operation
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

/**
 * Safe write method that handles write errors gracefully
 * @param {Socket} socket - The socket to write to
 * @param {Object|string} data - The data to write
 * @returns {boolean} - Whether the write was successful
 */
function safeWrite(socket, data) {
  if (!socket || socket.destroyed) {
    return false;
  }
  
  try {
    // If data is an object, convert to JSON string
    const message = typeof data === 'object' ? JSON.stringify(data) + '\n' : data;
    return socket.write(message);
  } catch (error) {
    console.error(`Write error: ${error.message}`);
    return false;
  }
}

// Create the TCP server
const server = net.createServer((socket) => {
  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`Client connected: ${clientId}`);
  
  // Add to active connections
  activeConnections.set(clientId, socket);
  
  // Handle data received from client
  let buffer = '';
  
  socket.on('data', (data) => {
    buffer += data.toString();
    
    // Check if we have a complete message (simple protocol: assume JSON objects end with newline)
    const messages = buffer.split('\n');
    buffer = messages.pop(); // Keep the last (potentially incomplete) message in the buffer
    
    // Process complete messages
    messages.forEach(messageStr => {
      if (!messageStr.trim()) return; // Skip empty messages
      
      try {
        const message = JSON.parse(messageStr);
        const response = processMessage(message);
        
        // Send response back to client
        safeWrite(socket, response);
      } catch (error) {
        // Handle JSON parsing errors
        safeWrite(socket, { 
          status: 'error', 
          result: 'Invalid JSON format' 
        });
      }
    });
  });

  // Handle client disconnection
  socket.on('end', () => {
    console.log(`Client disconnected gracefully: ${clientId}`);
    cleanupConnection(clientId);
  });
  
  // Handle client timeout
  socket.on('timeout', () => {
    console.log(`Client connection timed out: ${clientId}`);
    socket.end();
    cleanupConnection(clientId);
  });

  // Handle socket errors with specific error codes
  socket.on('error', (err) => {
    if (err.code === 'EPIPE') {
      console.log(`Client connection broken (EPIPE): ${clientId}`);
    } else if (err.code === 'ECONNRESET') {
      console.log(`Client connection reset by peer (ECONNRESET): ${clientId}`);
    } else {
      console.error(`Socket error for client ${clientId}: ${err.code} - ${err.message}`);
    }
    
    // Cleanup the socket
    cleanupConnection(clientId);
  });
  
  // Set socket timeout
  socket.setTimeout(60000); // 60 seconds timeout
});

/**
 * Clean up a connection by ID
 * @param {string} clientId - The client ID to clean up
 */
function cleanupConnection(clientId) {
  const socket = activeConnections.get(clientId);
  
  if (socket) {
    // Remove from active connections
    activeConnections.delete(clientId);
    
    // Close the socket if not already closed
    if (!socket.destroyed) {
      socket.destroy();
    }
    
    console.log(`Connection cleaned up: ${clientId} (Active connections: ${activeConnections.size})`);
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`MCP Calculator Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error(`Server error: ${err.code} - ${err.message}`);
  
  // Handle specific server errors
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose another port.`);
    process.exit(1);
  }
});

// Implement graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Gracefully shutdown the server
 */
function gracefulShutdown() {
  console.log('Shutting down server gracefully...');
  
  // Stop accepting new connections
  server.close(() => {
    console.log('Server closed, no longer accepting connections');
  });
  
  // Close all active connections
  if (activeConnections.size > 0) {
    console.log(`Closing ${activeConnections.size} active connections...`);
    
    for (const [clientId, socket] of activeConnections.entries()) {
      console.log(`Closing connection to ${clientId}`);
      socket.end('Server shutting down\n');
      
      // Force close after a timeout
      setTimeout(() => {
        if (!socket.destroyed) {
          socket.destroy();
        }
      }, 2000);
    }
    
    // Allow some time for connections to close gracefully before exiting
    setTimeout(() => {
      console.log('Exiting process');
      process.exit(0);
    }, 3000);
  } else {
    console.log('No active connections to close');
    process.exit(0);
  }
}

module.exports = server; // Export for testing purposes

