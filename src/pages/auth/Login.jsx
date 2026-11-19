
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginAPI } from "../../services/allAPIs";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the corresponding error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Login Data:", {
        ...formData,
        rememberMe,
      });

      try{
        const response = await loginAPI({
          email: formData.email,
          password: formData.password,
        });
        console.log(response);
        if (response.status === 200) {
          toast.success("Login successful!");
          const data = response.data;
          sessionStorage.setItem("data", JSON.stringify(data));
          navigate("/home");
        }
        else {
          toast.error("Login failed. Please try again.");
        }
      }
      catch(error){
        console.log(error);
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">

      {/* Left Branding Section */}
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-logo">
            <i className="bi bi-box-seam"></i>
            <span>StoreX</span>
          </div>

          <div className="brand-message">
            <h1>Welcome Back!</h1>
            <p>
              Manage your inventory, track transactions,
              and grow your business with ease.
            </p>
          </div>

          <div className="brand-illustration">
            <i className="bi bi-boxes"></i>
          </div>

          <p className="brand-tagline">
            Manage Smarter. Grow Better.
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="login-form-section">
        <div className="login-card">

          <h2>Sign In</h2>
          <p className="login-subtitle">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  type="email"
                  className={`form-control ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>

              {errors.email && (
                <small className="text-danger">
                  {errors.email}
                </small>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="input-group-text password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>

              {errors.password && (
                <small className="text-danger">
                  {errors.password}
                </small>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            {/* <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div> */}

            <button type="submit" className="login-btn">
              Sign In
              <i className="bi bi-arrow-right ms-2"></i>
            </button>

          </form>

          <div className="register-link">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
