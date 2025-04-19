import React, { useState } from 'react';
import './OperationPanel.css';

const OperationPanel = ({ performOperation }) => {
  const [operation, setOperation] = useState('sum');
  const [operandInput, setOperandInput] = useState('');
  const [operands, setOperands] = useState([]);
  const [inputError, setInputError] = useState('');

  // Operation descriptions for tooltips
  const operationDescriptions = {
    sum: "Adds all numbers together",
    subtract: "Subtracts all subsequent numbers from the first number",
    multiply: "Multiplies all numbers together",
    divide: "Divides the first number by all subsequent numbers",
    percentage: "Calculates percentage of first number based on second number"
  };

  const handleAddOperand = () => {
    setInputError('');
    
    if (!operandInput.trim()) {
      setInputError('Please enter a number');
      return;
    }
    
    const number = parseFloat(operandInput);
    if (isNaN(number)) {
      setInputError('Please enter a valid number');
      return;
    }
    
    setOperands([...operands, number]);
    setOperandInput('');
  };

  const handleRemoveOperand = (index) => {
    const newOperands = [...operands];
    newOperands.splice(index, 1);
    setOperands(newOperands);
  };

  const handleClearOperands = () => {
    setOperands([]);
    setInputError('');
  };

  const handleCalculate = () => {
    if (operands.length === 0) {
      setInputError('Please add at least one operand');
      return;
    }

    // Special validation for divide and percentage
    if (operation === 'divide') {
      if (operands.length < 2) {
        setInputError('Division requires at least two operands');
        return;
      }
      if (operands.slice(1).some(op => op === 0)) {
        setInputError('Cannot divide by zero');
        return;
      }
    } else if (operation === 'percentage') {
      if (operands.length !== 2) {
        setInputError('Percentage calculation requires exactly two operands');
        return;
      }
    }

    setInputError('');
    performOperation(operation, operands);
  };

  return (
    <div className="operation-panel">
      <div className="operation-selector">
        <label htmlFor="operation">Select Operation:</label>
        <select 
          id="operation"
          value={operation} 
          onChange={(e) => setOperation(e.target.value)}
          className="operation-dropdown"
          title={operationDescriptions[operation]}
        >
          <option value="sum">Sum</option>
          <option value="subtract">Subtract</option>
          <option value="multiply">Multiply</option>
          <option value="divide">Divide</option>
          <option value="percentage">Percentage</option>
        </select>
        <div className="operation-description">
          {operationDescriptions[operation]}
        </div>
      </div>
      
      <div className="operands-input">
        <label htmlFor="operand">Add Operand:</label>
        <div className="input-group">
          <input 
            id="operand"
            type="number" 
            value={operandInput} 
            onChange={(e) => setOperandInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOperand()}
            placeholder="Enter a number"
            className="operand-input"
          />
          <button onClick={handleAddOperand} className="add-operand-btn">Add</button>
        </div>
        {inputError && <div className="input-error">{inputError}</div>}
      </div>
      
      <div className="operands-list">
        <label>Current Operands:</label>
        {operands.length === 0 ? (
          <div className="no-operands">No operands added yet</div>
        ) : (
          <ul className="operands">
            {operands.map((operand, index) => (
              <li key={index} className="operand-item">
                {operand}
                <button 
                  onClick={() => handleRemoveOperand(index)}
                  className="remove-operand-btn"
                  aria-label={`Remove operand ${operand}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {operands.length > 0 && (
          <button onClick={handleClearOperands} className="clear-operands-btn">
            Clear All
          </button>
        )}
      </div>
      
      <button 
        onClick={handleCalculate} 
        disabled={operands.length === 0 || inputError}
        className={`calculate-btn ${(operands.length === 0 || inputError) ? 'disabled' : ''}`}
      >
        Calculate
      </button>
    </div>
  );
};

export default OperationPanel;
