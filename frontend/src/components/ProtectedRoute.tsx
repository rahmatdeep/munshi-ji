import { Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout />;
}
