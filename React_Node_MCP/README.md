# Node MCP Calculator Server

A Message Control Protocol (MCP) server for a calculator application built with Node.js. This server accepts requests for basic arithmetic operations (addition, subtraction, and multiplication) and returns the results over a TCP connection.

## Project Description

This project implements a simple Model Context Protocol (MCP) server that allows clients to request mathematical calculations. The server:

- Accepts connections from clients over TCP
- Processes calculation requests according to the MCP protocol
- Performs basic arithmetic operations: sum, subtraction, and multiplication
- Returns calculation results formatted according to the protocol specification

The implementation provides a clean separation between the calculator logic and the server protocol handling, making it easy to extend with additional operations in the future.

## Installation

### Prerequisites

- Node.js (v12.0.0 or higher)

### Setup Instructions

1. Clone this repository:
   ```
   git clone <repository-url>
   cd Node_MCP_Server
   ```

2. Install dependencies (if any are added in the future):
   ```
   npm install
   ```

## Protocol Documentation

### Message Format

The MCP protocol defines the format for requests and responses as follows:

#### Request Format

Requests must be sent as JSON objects with the following structure:

```json
{
  "operation": "<operation-type>",
  "operands": [<number>, <number>, ...]
}
```

Where:
- `operation`: String specifying the operation to perform. Valid values are:
  - `"sum"`: Addition of all operands
  - `"subtract"`: Subtraction of all subsequent operands from the first operand
  - `"multiply"`: Multiplication of all operands
- `operands`: Array of numbers to operate on

Each message should be terminated with a newline character (`\n`).

#### Response Format

Responses are sent as JSON objects with the following structure:

```json
{
  "status": "<status-type>",
  "result": <result-value>
}
```

Where:
- `status`: String indicating the status of the operation. Values are:
  - `"success"`: Operation completed successfully
  - `"error"`: An error occurred during processing
- `result`: 
  - For successful operations: The numerical result of the calculation
  - For errors: A string describing the error

Each response is terminated with a newline character (`\n`).

### Error Handling

The server handles the following error cases:

- Invalid JSON format: Returns error indicating the message couldn't be parsed
- Missing required fields: Returns error if operation or operands are missing
- Unknown operation: Returns error if the requested operation isn't supported
- Invalid operands: Returns error if operands aren't valid numbers
- Other calculation errors: Returns appropriate error messages

## Usage Examples

### Example 1: Addition

Request:
```json
{"operation": "sum", "operands": [1, 2, 3, 4]}
```

Response:
```json
{"status": "success", "result": 10}
```

### Example 2: Subtraction

Request:
```json
{"operation": "subtract", "operands": [10, 2, 3]}
```

Response:
```json
{"status": "success", "result": 5}
```

### Example 3: Multiplication

Request:
```json
{"operation": "multiply", "operands": [2, 3, 4]}
```

Response:
```json
{"status": "success", "result": 24}
```

### Example 4: Error - Invalid Operation

Request:
```json
{"operation": "divide", "operands": [10, 2]}
```

Response:
```json
{"status": "error", "result": "Unknown operation: divide"}
```

### Example 5: Error - Invalid Operands

Request:
```json
{"operation": "sum", "operands": [1, "two", 3]}
```

Response:
```json
{"status": "error", "result": "Invalid operands: expected an array of numbers"}
```

## Running the Server

To start the MCP calculator server:

```
node src/server.js
```

The server will listen on port 3000 by default. You should see output confirming the server is running:

```
MCP Calculator Server running on port 3000
```

### Testing with a TCP Client

You can test the server using a simple TCP client like `netcat`:

```
echo '{"operation": "sum", "operands": [1, 2, 3, 4]}' | nc localhost 3000
```

Or for continuous interaction:

```
nc localhost 3000
```

Then input JSON messages one per line, for example:
```
{"operation": "sum", "operands": [1, 2, 3, 4]}
{"operation": "multiply", "operands": [2, 3, 4]}
```

## Extending the Server

The server can be extended by adding new operations to the calculator module and updating the server's processMessage function to handle the new operations.

