/**
 * Test client for MCP Calculator Server
 * This script tests various scenarios including normal operations,
 * error handling, and connection issues
 * 
 * Supports testing of calculator operations:
 * - sum: Add all numbers in the array
 * - subtract: Subtract all subsequent numbers from the first
 * - multiply: Multiply all numbers in the array
 * - divide: Divide the first number by all subsequent numbers
 * - percentage: Calculate percentage of first number based on second number
 */

const net = require('net');
const readline = require('readline');

// Server connection details
const HOST = 'localhost';
const PORT = 3000;

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

let client;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * Connect to the MCP server
 */
function connectToServer() {
  // Create a new client socket
  client = new net.Socket();
  
  // Set up event handlers
  client.on('connect', () => {
    console.log(`${COLORS.green}Connected to MCP server at ${HOST}:${PORT}${COLORS.reset}`);
    reconnectAttempts = 0;
    runTests();
  });
  
  client.on('data', (data) => {
    const responses = data.toString().trim().split('\n');
    responses.forEach(responseStr => {
      if (!responseStr) return;
      
      try {
        const response = JSON.parse(responseStr);
        console.log(`${COLORS.cyan}Response: ${JSON.stringify(response, null, 2)}${COLORS.reset}`);
      } catch (error) {
        console.log(`${COLORS.yellow}Raw response: ${responseStr}${COLORS.reset}`);
      }
    });
  });
  
  client.on('close', () => {
    console.log(`${COLORS.yellow}Connection closed${COLORS.reset}`);
    
    // Try to reconnect if disconnected unexpectedly during tests
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`${COLORS.yellow}Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...${COLORS.reset}`);
      setTimeout(connectToServer, 2000);
    }
  });
  
  client.on('error', (err) => {
    console.log(`${COLORS.red}Connection error: ${err.message}${COLORS.reset}`);
  });
  
  // Connect to the server
  client.connect(PORT, HOST);
}

/**
 * Send a message to the server
 * @param {Object|string} message - The message to send
 */
function sendMessage(message) {
  const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
  console.log(`${COLORS.magenta}Sending: ${messageStr}${COLORS.reset}`);
  
  try {
    client.write(messageStr + '\n');
  } catch (error) {
    console.log(`${COLORS.red}Failed to send message: ${error.message}${COLORS.reset}`);
  }
}

/**
 * Run a series of test operations
 */
function runTests() {
  // Setup test cases
  // Setup test cases
  const tests = [
    // Valid operations
    { operation: 'sum', operands: [1, 2, 3, 4, 5] },
    { operation: 'subtract', operands: [100, 20, 30] },
    { operation: 'multiply', operands: [2, 3, 4] },
    { operation: 'divide', operands: [100, 2, 5] },
    { operation: 'percentage', operands: [200, 15] },
    
    // Invalid operations
    { operation: 'power', operands: [2, 3] },
    { operation: 'sqrt', operands: [16] },
    // Missing fields
    { operation: 'sum' },
    { operands: [1, 2, 3] },
    
    // Invalid operands
    { operation: 'sum', operands: [1, 'two', 3] },
    { operation: 'multiply', operands: [] },
    
    // Specific error cases for divide
    { operation: 'divide', operands: [10, 0] },        // Division by zero
    { operation: 'divide', operands: [10] },           // Not enough operands
    
    // Specific error cases for percentage
    { operation: 'percentage', operands: [100, 20, 30] }, // Too many operands
    { operation: 'percentage', operands: [100] },         // Not enough operands
    
    // Malformed JSON (will be sent as raw string)
    '{ "operation": "sum", "operands": [1, 2, 3]',
    
    // Empty message
    ''
  ];
  
  // Run normal test cases with delay between them
  let index = 0;
  const testInterval = setInterval(() => {
    if (index < tests.length) {
      const test = tests[index++];
      sendMessage(test);
    } else {
      clearInterval(testInterval);
      console.log(`${COLORS.green}All automated tests completed${COLORS.reset}`);
      
      // Enter interactive mode
      startInteractiveMode();
    }
  }, 1000);
}

/**
 * Start interactive command mode
 */
function startInteractiveMode() {
  console.log(`
${COLORS.green}=== Interactive Mode ===
Available commands:
- send <json>: Send a custom JSON message
- reconnect: Force disconnect and reconnect
- close: Close the connection
- exit: Exit the client

Example operations:
  {"operation": "sum", "operands": [1, 2, 3]}
  {"operation": "subtract", "operands": [10, 2, 3]}
  {"operation": "multiply", "operands": [2, 3, 4]}
  {"operation": "divide", "operands": [100, 4, 5]}
  {"operation": "percentage", "operands": [200, 25]}
${COLORS.reset}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  
  rl.prompt();
  
  rl.on('line', (line) => {
    const input = line.trim();
    const [command, ...args] = input.split(' ');
    
    switch (command.toLowerCase()) {
      case 'send':
        try {
          const message = JSON.parse(args.join(' '));
          sendMessage(message);
        } catch (error) {
          console.log(`${COLORS.red}Invalid JSON: ${error.message}${COLORS.reset}`);
        }
        break;
        
      case 'reconnect':
        console.log(`${COLORS.yellow}Forcing reconnection...${COLORS.reset}`);
        client.destroy();
        setTimeout(connectToServer, 1000);
        break;
        
      case 'close':
        console.log(`${COLORS.yellow}Closing connection...${COLORS.reset}`);
        client.end();
        break;
        
      case 'exit':
        console.log(`${COLORS.green}Exiting client...${COLORS.reset}`);
        client.destroy();
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.log(`${COLORS.red}Unknown command: ${command}${COLORS.reset}`);
        break;
    }
    
    rl.prompt();
  });
}

// Start the client
console.log(`${COLORS.green}Starting MCP Calculator Test Client${COLORS.reset}`);
connectToServer();

