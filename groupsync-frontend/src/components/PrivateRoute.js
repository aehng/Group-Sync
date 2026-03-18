// base created with ai

import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading, validateToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // verify the token with server each time this route is rendered
  useEffect(() => {
    if (!isAuthenticated) return;
    setChecking(true);
    validateToken()
      .then(valid => {
        if (!valid) {
          navigate("/login", { replace: true });
        }
      })
      .finally(() => setChecking(false));
  }, [isAuthenticated, validateToken, navigate]);

  if (loading || checking) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
