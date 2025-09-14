
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to home page which is now the dashboard
  return <Navigate to="/" replace />;
};

export default Index;
