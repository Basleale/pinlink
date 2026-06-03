import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() { // wrap all the components/expect login and register/ with this in the routes so that only logged in users can access them
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace/>; //replace keyword to the browser history stack to prevent back looping
  }

  return <Outlet />;
}

export default ProtectedRoute;