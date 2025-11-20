import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ResetPassword.css"; // You can reuse ForgotPassword.css styling

interface ResetPasswordFormData {
  password: string;
  passwordConfirm: string;
}

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string>("");
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Get token from URL

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitting(true);
    setError("");

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match.");
      setIsFormSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsFormSubmitting(false);
      return;
    }

    try {
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/user/resetPassword/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "failed") {
        throw new Error(
          data.message || "Failed to reset password. Please try again."
        );
      }

      // Success - redirect to login with success message
      navigate("/login", { 
        state: { 
          message: "Password reset successful! Please log in with your new password." 
        } 
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to reset password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="forgot-password-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-5 col-lg-4">
            <div className="card login-card shadow-lg">
              <div className="card-body p-5 text-center">
                <h2 className="mb-4">Invalid Reset Link</h2>
                <p className="text-muted mb-4">
                  This password reset link is invalid or has expired.
                </p>
                <a href="/forgot-password" className="btn btn-primary">
                  Request New Reset Link
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      {/* Star effect layers */}
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <div className="card login-card shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="constellation-icon mb-3">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="15" r="3" fill="currentColor" />
                    <circle cx="25" cy="10" r="2.5" fill="currentColor" />
                    <circle cx="40" cy="20" r="3" fill="currentColor" />
                    <circle cx="50" cy="35" r="2.5" fill="currentColor" />
                    <circle cx="35" cy="45" r="2.5" fill="currentColor" />
                    <circle cx="15" cy="40" r="2.5" fill="currentColor" />
                    <line
                      x1="10"
                      y1="15"
                      x2="25"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                    <line
                      x1="25"
                      y1="10"
                      x2="40"
                      y2="20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                    <line
                      x1="40"
                      y1="20"
                      x2="50"
                      y2="35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                    <line
                      x1="50"
                      y1="35"
                      x2="35"
                      y2="45"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                    <line
                      x1="35"
                      y1="45"
                      x2="15"
                      y2="40"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                    <line
                      x1="15"
                      y1="40"
                      x2="10"
                      y2="15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="1"
                    />
                  </svg>
                </div>
                <h2 className="login-title mb-2">Reset Password</h2>
                <p className="text-muted">Enter your new password</p>
              </div>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    name="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <small className="text-muted">
                    Must be at least 8 characters
                  </small>
                </div>

                <div className="mb-4">
                  <label htmlFor="passwordConfirm" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    placeholder="Confirm new password"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isFormSubmitting}
                >
                  {isFormSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0 small text-muted">
                  Remember your password?{" "}
                  <a href="/login" className="text-decoration-none">
                    Back to Login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;