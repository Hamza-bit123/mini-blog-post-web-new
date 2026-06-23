import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prv) => ({ ...prv, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );

    const data = await response.json();
    if (data.success) {
      sessionStorage.setItem("token", data.accessToken);
      navigate("/");
    } else {
      sessionStorage.removeItem("token");
      setError(data.error);
    }
  };
  return (
    <div className="auth_container">
      <div className="auth_left">
        <h2 className="auth_left--title">MiniBlog</h2>
        <p className="auth_left--description description">
          Write stories, share ideas, and explore blogs from developers around
          the world.
        </p>
      </div>
      <div className="auth_form_container">
        <form onSubmit={handleSubmit}>
          <h3 className="form--title">Login to your Account</h3>
          <div className="auth--input_wrapper">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="auth--input_wrapper">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              value={formData.password}
            />
          </div>
          <button type="submit">Login</button>
          <Link to="/register">or create new account</Link>
          {error && <span className="error">{error}</span>}
        </form>
      </div>
    </div>
  );
}

export default Login;
