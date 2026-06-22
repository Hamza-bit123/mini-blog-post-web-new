import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import SideNav from "./sideNav";
import { UserContext } from "../context/userContext";
import { fetchWithAuth } from "../api/api";
import Header from "./header";
import "./protectedLayout.css";
import { HeaderContext } from "../context/headerContext";

function ProtectedLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleSidebar, setToggleSidebar] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return <Navigate to="/login" />;

    const fetchData = async () => {
      try {
        const response = await fetchWithAuth("http://localhost:4000/api/me", {
          method: "POST",
        });
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        alert("Try again later!");
        console.log("error from protected: " + error);
      } finally {
        setLoading(false);
      }
    };

    if (window.innerWidth <= 700) setToggleSidebar(false);

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <HeaderContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
        <section className="layout">
          <SideNav />
          <main className="main--section">
            <Header />
            <Outlet />
          </main>
        </section>
      </HeaderContext.Provider>
    </UserContext.Provider>
  );
}

export default ProtectedLayout;
