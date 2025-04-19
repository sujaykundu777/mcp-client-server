import React from 'react';
import './DisplayScreen.css';

const DisplayScreen = ({ result, error, operation, operands }) => {
  // Format operation name for display
  const formatOperation = (op) => {
    if (!op) return '';
    return op.charAt(0).toUpperCase() + op.slice(1);
  };
  
  // Format operands for display
  const formatOperands = (ops) => {
    if (!ops || ops.length === 0) return '';
    return ops.map(op => 
      typeof op === 'number' && Math.floor(op) !== op ? 
        op.toFixed(2) : 
        op
    ).join(', ');
  };
  
  // Format result value
  const formatResult = (val) => {
    if (val === null || val === undefined) return 'Ready';
    if (typeof val === 'number') {
      // For decimal numbers, show up to 4 decimal places
      return Math.floor(val) !== val ? val.toFixed(4) : val.toString();
    }
    return val.toString();
  };

  return (
    <div className="display-screen">
      <div className="operation-display">
        {operation && (
          <div className="current-operation">
            <span className="operation-label">Operation:</span>
            <span className="operation-value">{formatOperation(operation)}</span>
          </div>
        )}
        
        {operands && operands.length > 0 && (
          <div className="current-operands">
            <span className="operands-label">Operands:</span>
            <span className="operands-value">[{formatOperands(operands)}]</span>
          </div>
        )}
      </div>
      
      <div className={`result-display ${error ? 'error' : result !== null ? 'success' : ''}`}>
        {error ? (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="result-value">
            {formatResult(result)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayScreen;
