import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import GroupMessagesPage from "./pages/GroupMessagesPage";
import PrivateRoute from "./components/PrivateRoute";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import GroupWorkspace from "./pages/GroupWorkspace";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* Temporary landing route */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Workspace and messaging routes */}
          <Route path="/groups/:groupId" element={<PrivateRoute><GroupWorkspace /></PrivateRoute>} />
          <Route path="/groups/:groupId/messages" element={<PrivateRoute><GroupMessagesPage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
