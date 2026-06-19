import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

function ProtectedRoute({ children, allowedRoles }) {
  const user = auth.currentUser;

  if (!user) return <Navigate to="/login" />;

  if (!user.role) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
