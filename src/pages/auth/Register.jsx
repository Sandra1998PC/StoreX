
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import { toast } from "react-toastify";
import { registerAPI } from "../../services/allAPIs";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        setErrors((prev) => ({
            ...prev,
            [name]: "",
            ...(name === "password" ? { confirmPassword: "" } : {}),
        }));
    };

    const validate = () => {
        let error = {};

        // Full Name Validation
        const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

        if (!formData.name.trim()) {
            error.name = "Full name is required";
        } else if (formData.name.trim().length < 3) {
            error.name = "Name must contain at least 3 characters";
        } else if (!nameRegex.test(formData.name.trim())) {
            error.name = "Name should contain only letters and spaces";
        }

        // Email Validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

        if (!formData.email.trim()) {
            error.email = "Email is required";
        } else if (!emailRegex.test(formData.email.trim())) {
            error.email = "Invalid email address";
        }

        // Phone Validation
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!formData.phone.trim()) {
            error.phone = "Phone number is required";
        } else if (!phoneRegex.test(formData.phone.trim())) {
            error.phone = "Enter a valid 10-digit phone number";
        }

        // Password Strength Validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

        if (!formData.password) {
            error.password = "Password is required";
        } else if (!passwordRegex.test(formData.password)) {
            error.password =
                "Minimum 8 characters with uppercase, lowercase, number and special character";
        }

        // Confirm Password Validation
        if (!formData.confirmPassword) {
            error.confirmPassword = "Confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            error.confirmPassword = "Passwords do not match";
        }

        // Terms Validation
        // if (!acceptTerms) {
        //     error.terms = "Please accept the Terms and Conditions";
        // }

        setErrors(error);

        return Object.keys(error).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            const {
                name,
                email,
                phone,
                password,
            } = formData;

            console.log("Form Data:", {
                name,
                email,
                phone,
                password,
            });

            try {
                const result = await registerAPI({
                    name,
                    email,
                    phonenumber : phone,
                    password
                });
                console.log(result);
                if (result.status == 201) {
                    toast.success("Registered Successfully !!!");
                    setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        confirmPassword: "",
                    })
                }
                else {
                    toast.error("Something Went Wrong !!!");
                }
            }
            catch (error) {

                if (error.response?.status === 409) {

                    toast.warning("User Already Exists!");

                } else {

                    toast.error("Something Went Wrong !!!");
                }
            }
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">

                {/* Branding Section */}
                <div className="register-brand">
                    <div className="brand-content">
                        <div className="brand-logo">
                            <i className="bi bi-box-seam"></i>
                            <span>StoreX</span>
                        </div>

                        <div className="brand-message">
                            <h1>Manage Smarter.<br />Grow Better.</h1>
                            <p>
                                Your business, products and inventory
                                management — all in one place.
                            </p>
                        </div>

                        <div className="brand-footer">
                            Smart Inventory & Business Management
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="register-form-section">
                    <div className="register-form-wrapper">

                        <div className="mobile-brand">
                            <i className="bi bi-box-seam"></i> StoreX
                        </div>

                        <div className="form-heading">
                            <h2>Create Account</h2>
                            <p>Get started with your StoreX account.</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            {/* Full Name */}
                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />
                                {errors.name && (
                                    <small className="text-danger">{errors.name}</small>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <small className="text-danger">{errors.email}</small>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                />
                                {errors.phone && (
                                    <small className="text-danger">{errors.phone}</small>
                                )}
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <small className="text-danger">{errors.password}</small>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && (
                                    <small className="text-danger">
                                        {errors.confirmPassword}
                                    </small>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            {/* <div className="form-check mb-4">
                                <input
                                    type="checkbox"
                                    className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
                                    id="terms"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                        setAcceptTerms(e.target.checked);
                                        setErrors((prev) => ({
                                            ...prev,
                                            terms: "",
                                        }));
                                    }}
                                />
                                <label className="form-check-label" htmlFor="terms">
                                    I agree to the Terms and Conditions
                                </label>

                                {errors.terms && (
                                    <small className="text-danger d-block">
                                        {errors.terms}
                                    </small>
                                )}
                            </div> */}

                            {/* Submit Button */}
                            <button type="submit" className="btn register-btn w-100">
                                Create Account
                            </button>

                        </form>

                        <div className="login-link">
                            Already have an account?
                            <Link to="/"> Sign In</Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;
