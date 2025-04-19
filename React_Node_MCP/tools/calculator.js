/**
 * Calculator module for MCP server
 * Provides basic mathematical operations with proper validation
 */

/**
 * Validates that all elements in the input array are valid numbers
 * @param {Array} operands - Array of values to validate
 * @returns {Boolean} - True if all operands are valid numbers, false otherwise
 */
function validateOperands(operands) {
  if (!Array.isArray(operands)) {
    return false;
  }
  
  if (operands.length === 0) {
    return false;
  }
  
  return operands.every(operand => 
    typeof operand === 'number' && !isNaN(operand) && isFinite(operand)
  );
}

/**
 * Adds all numbers in the array
 * @param {Array<number>} operands - Numbers to add
 * @returns {number} - Sum of all operands
 * @throws {Error} - If operands are invalid
 */
function sum(operands) {
  if (!validateOperands(operands)) {
    throw new Error('Invalid operands: expected an array of numbers');
  }
  
  return operands.reduce((total, current) => total + current, 0);
}

/**
 * Subtracts subsequent numbers from the first number
 * @param {Array<number>} operands - Numbers to subtract
 * @returns {number} - Result of subtraction
 * @throws {Error} - If operands are invalid
 */
function subtract(operands) {
  if (!validateOperands(operands)) {
    throw new Error('Invalid operands: expected an array of numbers');
  }
  
  const firstOperand = operands[0];
  
  if (operands.length === 1) {
    return firstOperand;
  }
  
  return operands.slice(1).reduce((result, current) => result - current, firstOperand);
}

/**
 * Multiplies all numbers in the array
 * @param {Array<number>} operands - Numbers to multiply
 * @returns {number} - Product of all operands
 * @throws {Error} - If operands are invalid
 */
function multiply(operands) {
  if (!validateOperands(operands)) {
    throw new Error('Invalid operands: expected an array of numbers');
  }
  
  return operands.reduce((product, current) => product * current, 1);
}

/**
 * Divides the first number by all subsequent numbers
 * @param {Array<number>} operands - Numbers to divide
 * @returns {number} - Result of division
 * @throws {Error} - If operands are invalid or if dividing by zero
 */
function divide(operands) {
  if (!validateOperands(operands)) {
    throw new Error('Invalid operands: expected an array of numbers');
  }
  
  if (operands.length < 2) {
    throw new Error('Division requires at least two operands');
  }
  
  const firstOperand = operands[0];
  
  // Check for division by zero
  for (let i = 1; i < operands.length; i++) {
    if (operands[i] === 0) {
      throw new Error('Division by zero is not allowed');
    }
  }
  
  return operands.slice(1).reduce((result, current) => result / current, firstOperand);
}

/**
 * Calculates percentage of the first number based on the second number
 * @param {Array<number>} operands - Numbers for percentage calculation
 * @returns {number} - Result of percentage calculation
 * @throws {Error} - If operands are invalid
 */
function percentage(operands) {
  if (!validateOperands(operands)) {
    throw new Error('Invalid operands: expected an array of numbers');
  }
  
  if (operands.length !== 2) {
    throw new Error('Percentage calculation requires exactly two operands');
  }
  
  const value = operands[0];
  const percent = operands[1];
  
  return (value * percent) / 100;
}

module.exports = {
  sum,
  subtract,
  multiply,
  divide,
  percentage
};

