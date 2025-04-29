// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loader/spinner of your choice
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
