import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

function ProtectedRoute({ children }) {
  const user = auth.currentUser;
  const role = localStorage.getItem("role");

  if (!user || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
