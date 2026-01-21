import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GroupMessagesPage from "./pages/GroupMessagesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Temporary landing route */}
        <Route path="/" element={<Navigate to="/groups/1/messages" replace />} />

        {/* Messaging route */}
        <Route path="/groups/:groupId/messages" element={<GroupMessagesPage />} />

        {/* Fallback */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
