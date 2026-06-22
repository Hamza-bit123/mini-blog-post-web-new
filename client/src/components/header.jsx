import React, { useContext } from "react";
import { LayoutSidebar, SunFill, MoonFill } from "react-bootstrap-icons";
import "./header.css";
import { HeaderContext } from "../context/headerContext";
import { useTheme } from "../context/themeContext";

function Header() {
  const { toggleSidebar, setToggleSidebar } = useContext(HeaderContext);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="header">
      <button
        className="header--sidebar-toggle"
        onClick={() => setToggleSidebar(!toggleSidebar)}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <LayoutSidebar size={20} />
      </button>

      <div className="header--right">
        <button
          className="header--theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <SunFill size={18} color="#facc15" /> : <MoonFill size={18} color="#6366f1" />}
        </button>
      </div>
    </div>
  );
}

export default Header;
