import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import Popup from "../../components/popup";
function Registration() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  //submit form
  const handleSignup = async (e) => {
    e.preventDefault();

    //validating input values
    if (!validate()) return console.log(error);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );

    const data = await response.json();
    if (data.success) {
      setMessage({ value: data.message, type: "success" });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      setMessage({ value: data.error, type: "error" });
      setTimeout(() => {
        setMessage(null);
      }, 1000);
    }
    console.log(data, response.status);
  };

  //controlling form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prv) => ({ ...prv, [name]: value }));
  };

  // form input validation
  const validate = () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      setError("All fields are required!");
      return 0;
    } else if (!email.includes("@")) {
      setError("Invalid email address");
      return 0;
    } else if (password.length < 4) {
      setError("Passward must be atleast 4 digit long!");
      return 0;
    }
    return 1;
  };

  return (
    <div className="auth_container">
      <div className="auth_left">
        <div className="image">
          <img src="src\assets\logo.png" alt="logo" width={50} />
        </div>
        <h2 className="auth_left--title">MiniBlog</h2>
        <p className="auth_left--description description">
          Write stories, share ideas, and explore blogs from developers around
          the world.
        </p>
      </div>
      <div className="auth_form_container">
        <form action="" className="auth_form" onSubmit={handleSignup}>
          <h3 className="form--title">Register</h3>
          <div className="auth--input_wrapper">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="John Swith"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth--input_wrapper">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="johnsmith@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth--input_wrapper">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="123"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Create Account</button>
          {error && <span className="error">{error}</span>}
          <Link to="/login">already have an account</Link>
        </form>
      </div>
      {message && <Popup message={message} />}
    </div>
  );
}

export default Registration;
