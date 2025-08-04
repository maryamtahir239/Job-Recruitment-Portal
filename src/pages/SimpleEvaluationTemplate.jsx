import React from "react";

const SimpleEvaluationTemplate = () => {
  console.log("=== SimpleEvaluationTemplate component rendering... ===");
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'yellow', color: 'black' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SIMPLE TEST PAGE</h1>
      <p>If you can see this yellow box, the component is rendering correctly.</p>
      <p>This is a simple test without any complex UI components.</p>
    </div>
  );
};

export default SimpleEvaluationTemplate; 