import React, { useState, FormEvent, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ForgotPassword.css";
import { useAuth } from "../../context/AuthContext";

interface LoginFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
    });
    const [error, setError] = useState<string>("");
    const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);

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
    
        try {
          // await login(formData);
          // The context handles navigation to /dashboard on success.
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || "Sign in failed. Please try again.");
          } else {
            setError("An unexpected error occurred during sign-in.");
          }
        } finally {
          setIsFormSubmitting(false);
        }
    };

    return(
        <div className="forgot-password-container">
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
                  <h2 className="login-title mb-2">Forgot Password</h2>
                  <p className="text-muted">Enter your email below to reset your password</p>
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
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
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
                        Signing in...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0 small text-muted">
                    <a href="/login" className="text-decoration-none">
                      Back To Login
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

export default ForgotPassword;