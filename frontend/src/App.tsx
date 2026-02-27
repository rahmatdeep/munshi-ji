import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import VerifyMagicLink from "./pages/VerifyMagicLink";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/verify-magic-link" element={<VerifyMagicLink />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
