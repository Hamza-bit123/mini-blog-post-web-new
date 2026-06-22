import React, { useContext } from "react";
import * as Icon from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { UserContext } from "../context/userContext";
import "./sideNav.css";
import { HeaderContext } from "../context/headerContext";
import { useTheme } from "../context/themeContext";
function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { isDark, toggleTheme } = useTheme();
  const { toggleSidebar, setToggleSidebar } = useContext(HeaderContext);

  return (
    <nav className="sideNav">
      <div className="icon--container">
        <div className="top">
          <div className="logo">
            <Icon.PenFill />
          </div>
          <ul className="nav--lists">
            <li
              className={
                location.pathname.includes("dashboard") ||
                location.pathname.includes("admin")
                  ? "active"
                  : ""
              }
              onClick={() => {
                navigate("/");
              }}
            >
              <Icon.BarChartLineFill />
            </li>
            <li
              className={location.pathname === "/posts" ? "active" : ""}
              onClick={() => {
                navigate("/posts");
              }}
            >
              <Icon.Signpost2Fill />
            </li>

            <li
              className={location.pathname === "/posts/me" ? "active" : ""}
              onClick={() => {
                navigate("/posts/me");
              }}
            >
              <Icon.SignpostFill />
            </li>
            {user?.role === "admin" && (
              <li
                className={
                  location.pathname === "/posts/management" ? "active" : ""
                }
                onClick={() => {
                  navigate("/posts/management");
                }}
              >
                <Icon.PersonWorkspace />
              </li>
            )}
            {/* {user?.role === "admin" && (
              <li
                className={
                  location.pathname === "/admin/userManagement" ? "active" : ""
                }
              >
                <Icon.PersonBoundingBox />
              </li>
            )} */}

            <li
              className={location.pathname === "/posts/create" ? "active" : ""}
              onClick={() => {
                navigate("/posts/create");
              }}
            >
              <Icon.NodePlusFill />
            </li>
          </ul>
        </div>
        <ul className="sidenav-bottom">
          <li
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Icon.SunFill color="#facc15" />
            ) : (
              <Icon.MoonFill color="#6366f1" />
            )}
          </li>
          <li className="sidenav--avator">
            <span>H</span>
          </li>
        </ul>
      </div>
      {toggleSidebar && window.innerWidth <= 700 && (
        <div
          className="close--sidebar-bg"
          onClick={() => {
            setToggleSidebar(false);
          }}
        ></div>
      )}

      {toggleSidebar && (
        <div className="content--container">
          <div className="top">
            <div className="logo">Mini Blog</div>
            <ul className="nav--lists">
              <li
                className={
                  location.pathname.includes("dashboard") ||
                  location.pathname.includes("admin")
                    ? "active"
                    : ""
                }
                onClick={() => {
                  navigate("/");
                }}
              >
                Dashboard
              </li>
              <li
                className={location.pathname === "/posts" ? "active" : ""}
                onClick={() => {
                  navigate("/posts");
                }}
              >
                Posts
              </li>

              <li
                className={location.pathname === "/posts/me" ? "active" : ""}
                onClick={() => {
                  navigate("/posts/me");
                }}
              >
                My posts
              </li>
              {user?.role === "admin" && (
                <li
                  onClick={() => {
                    navigate("/posts/management");
                  }}
                  className={
                    location.pathname === "/posts/management" ? "active" : ""
                  }
                >
                  Posts Management
                </li>
              )}
              {/* {user?.role === "admin" && (
                <li
                  onClick={() => {
                    navigate("/admin/userManagement");
                  }}
                  className={
                    location.pathname === "/admin/userManagement"
                      ? "active"
                      : ""
                  }
                >
                  Users Management
                </li>
              )} */}

              <li
                className={
                  location.pathname === "/posts/create" ? "active" : ""
                }
                onClick={() => {
                  navigate("posts/create");
                }}
              >
                Create post
              </li>
              {toggleSidebar && window.innerWidth <= 700 && (
                <Icon.XOctagonFill
                  onClick={() => {
                    setToggleSidebar(false);
                  }}
                  className="close--sidebar"
                  size={22}
                />
              )}
            </ul>
          </div>
          <ul className="sidenav-bottom">
            <li></li>
            <li>{user?.username}</li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default SideNav;
