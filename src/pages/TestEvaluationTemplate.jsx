import React from "react";

const TestEvaluationTemplate = () => {
  console.log("=== TestEvaluationTemplate component rendering... ===");
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600">Test Page Working!</h1>
      <p className="text-gray-600">If you can see this, the routing is working correctly.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Debug Info:</h2>
        <p>localStorage available: {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}</p>
        <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
        <p>User: {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
      </div>
    </div>
  );
};

export default TestEvaluationTemplate; 