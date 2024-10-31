// protectedroute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
 children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
 const location = useLocation();
 const sessionVariableExists = sessionStorage.getItem('type');

 if (!sessionVariableExists) {
    // Redirect to signin page if session variable does not exist
    return <Navigate to="/signin" state={{ from: location }} />;
 }

 // Render the children components if session variable exists
 return <>{children}</>;
};

export default ProtectedRoute;