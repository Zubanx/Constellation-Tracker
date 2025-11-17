import React, { useState, FormEvent, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
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
      await login(formData);
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

  return (
    <div className="login-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container">
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
                      <circle cx="10" cy="15" r="2" fill="#FFD700" />
                      <circle cx="25" cy="10" r="2.5" fill="#FFD700" />
                      <circle cx="40" cy="20" r="2" fill="#FFD700" />
                      <circle cx="50" cy="35" r="2" fill="#FFD700" />
                      <circle cx="35" cy="45" r="2.5" fill="#FFD700" />
                      <circle cx="15" cy="40" r="2" fill="#FFD700" />
                      <line
                        x1="10"
                        y1="15"
                        x2="25"
                        y2="10"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <line
                        x1="25"
                        y1="10"
                        x2="40"
                        y2="20"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <line
                        x1="40"
                        y1="20"
                        x2="50"
                        y2="35"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <line
                        x1="50"
                        y1="35"
                        x2="35"
                        y2="45"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <line
                        x1="35"
                        y1="45"
                        x2="15"
                        y2="40"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <line
                        x1="15"
                        y1="40"
                        x2="10"
                        y2="15"
                        stroke="#FFD700"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                  <h2 className="login-title mb-2">Constellation Tracker</h2>
                  <p className="text-muted">Chart your celestial journey</p>
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

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
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
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center">
                    <a
                      href="/forgot-password"
                      className="text-decoration-none small"
                    >
                      Forgot password?
                    </a>
                  </div>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0 small text-muted">
                    Don't have an account?{" "}
                    <a href="/register" className="text-decoration-none">
                      Sign up
                    </a>
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

export default Login;
