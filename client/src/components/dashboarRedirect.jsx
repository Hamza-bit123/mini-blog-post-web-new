import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/api";
import { Navigate } from "react-router-dom";

function DashboardRedirect() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth(
          `${import.meta.env.VITE_BACKEND_URL}/api/me`,
          {
            method: "POST",
          },
        );
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        alert("Try again later!");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading</div>;
  if (user?.role === "admin") return <Navigate to="/admin" />;
  return <Navigate to="/dashboard" />;
}

export default DashboardRedirect;
