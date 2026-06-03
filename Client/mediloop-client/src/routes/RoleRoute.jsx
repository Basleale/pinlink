import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRoles }) { 
  /*same concept as protected routes but for role based access 
    <RoleRoute allowedRoles={["admin", "editor"]}> <EditorDashboard />  </RoleRoute>*/
    
  const { user } = useAuth();

  //no login
  if (!user) {
    return <Navigate to="/login" replace/>; //replace to prevent infinite back loops
  }

  
  //unauthorized access
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace/>;
  }

  return <Outlet />;
}

export default RoleRoute;