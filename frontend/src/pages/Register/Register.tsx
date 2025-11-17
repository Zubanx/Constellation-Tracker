import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed
import "bootstrap/dist/css/bootstrap.min.css";
import "./Register.css";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, user, isAuthenticated } = useAuth(); // ← From your context

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and a number";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.general = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      // Success!
      alert("Account created successfully! Please check your email to confirm your account.");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setErrors({
        general: err.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-md-6 col-lg-5">
            <div className="card register-card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="constellation-icon mb-3">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <circle cx="10" cy="15" r="2" fill="#FFD700" />
                      <circle cx="25" cy="10" r="2.5" fill="#FFD700" />
                      <circle cx="40" cy="20" r="2" fill="#FFD700" />
                      <circle cx="50" cy="35" r="2" fill="#FFD700" />
                      <circle cx="35" cy="45" r="2.5" fill="#FFD700" />
                      <circle cx="15" cy="40" r="2" fill="#FFD700" />
                      <line x1="10" y1="15" x2="25" y2="10" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                      <line x1="25" y1="10" x2="40" y2="20" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                      <line x1="40" y1="20" x2="50" y2="35" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                      <line x1="50" y1="35" x2="35" y2="45" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                      <line x1="35" y1="45" x2="15" y2="40" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                      <line x1="15" y1="40" x2="10" y2="15" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                    </svg>
                  </div>
                  <h2 className="register-title mb-2">Create Account</h2>
                  <p className="text-muted">Begin your stellar journey</p>
                </div>

                {/* Show warning if already logged in */}
                {isAuthenticated && user && (
                  <div className="alert alert-info text-center mb-4">
                    You are currently logged in as <strong>{user.firstName} {user.lastName}</strong>.<br />
                    Creating a new account will not log you out automatically.
                  </div>
                )}

                {errors.general && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {errors.general}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setErrors((prev) => ({ ...prev, general: undefined }))}
                      aria-label="Close"
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      id="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <small className="form-text text-muted">
                      8+ characters with uppercase, lowercase, and number
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="acceptTerms">
                      I agree to the <a href="/terms" className="text-decoration-none">Terms and Conditions</a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <hr className="my-4" />
                <div className="text-center">
                  <p className="mb-0 small text-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="text-decoration-none">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;