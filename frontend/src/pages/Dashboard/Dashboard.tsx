import React, { useState, useEffect} from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import observationService, { Observation } from "../../services/observationService";

interface UserStats {
  totalObservations: number;
  constellationsTracked: number;
  favoriteConstellation: string;
  lastObservationDate: string;
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    totalObservations: 0,
    constellationsTracked: 0,
    favoriteConstellation: "Loading...",
    lastObservationDate: "N/A",
  });

  const [recentObservations, setRecentObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch recent observations (last 5)
      const observations = await observationService.getRecentObservations(token, 5);
      setRecentObservations(observations);

      // Calculate stats from observations
      if (observations.length > 0) {
        // Get unique constellations
        const uniqueConstellations = new Set(
          observations.map(obs => obs.constellationId._id)
        );

        // Find favorite constellation (most observed)
        const constellationCounts: { [key: string]: { name: string; count: number } } = {};
        observations.forEach(obs => {
          const id = obs.constellationId._id;
          const name = obs.constellationId.name;
          if (constellationCounts[id]) {
            constellationCounts[id].count++;
          } else {
            constellationCounts[id] = { name, count: 1 };
          }
        });

        const favoriteConst = Object.values(constellationCounts).reduce((max, current) =>
          current.count > max.count ? current : max
        );

        // Get last observation date
        const lastDate = observations[0].observationDate; // Already sorted by date (desc)

        setStats({
          totalObservations: observations.length,
          constellationsTracked: uniqueConstellations.size,
          favoriteConstellation: favoriteConst.name,
          lastObservationDate: lastDate,
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container py-5">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="dashboard-title">Welcome Back, Stargazer!</h1>
            <p className="dashboard-subtitle">
              Here's a summary of your celestial journey
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{stats.totalObservations}</div>
              <div className="stat-label">Total Observations</div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon">🌟</div>
              <div className="stat-value">{stats.constellationsTracked}</div>
              <div className="stat-label">Constellations Tracked</div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats.favoriteConstellation}</div>
              <div className="stat-label">Favorite Constellation</div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">
                {stats.lastObservationDate !== "N/A"
                  ? new Date(stats.lastObservationDate).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="stat-label">Last Observation</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="quick-actions-card">
              <h3 className="section-heading mb-4">Quick Actions</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <Link to="/constellations" className="action-btn">
                    <span className="action-icon">🔭</span>
                    <span className="action-text">Browse Constellations</span>
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link to="/observations/new" className="action-btn">
                    <span className="action-icon">➕</span>
                    <span className="action-text">Log Observation</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Observations */}
        <div className="row">
          <div className="col-12">
            <div className="recent-observations-card">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-heading mb-0">Recent Observations</h3>
                <Link
                  to="/observations"
                  className="btn btn-sm btn-outline-light"
                >
                  View All
                </Link>
              </div>

              {recentObservations.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">
                    No observations yet. Start tracking constellations!
                  </p>
                  <Link to="/observations/new" className="btn btn-primary mt-3">
                    Log Your First Observation
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table observation-table">
                    <thead>
                      <tr>
                        <th>Constellation</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentObservations.map((observation) => (
                        <tr key={observation._id}>
                          <td>
                            <strong>{observation.constellationId.name}</strong>
                            <span className="constellation-abbr ms-2">
                              {observation.constellationId.abbreviation}
                            </span>
                          </td>
                          <td>
                            {new Date(observation.observationDate).toLocaleDateString()}
                          </td>
                          <td>{observation.location}</td>
                          <td>
                            <Link
                              to={`/observations/${observation._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="progress-card">
              <h3 className="section-heading mb-4">Your Progress</h3>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Constellations Discovered</span>
                  <span>{stats.constellationsTracked}/88</span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${(stats.constellationsTracked / 88) * 100}%`,
                    }}
                    aria-valuenow={stats.constellationsTracked}
                    aria-valuemin={0}
                    aria-valuemax={88}
                  ></div>
                </div>
              </div>
              <p className="text-muted mb-0">
                Keep exploring! You've tracked {stats.constellationsTracked} out
                of 88 recognized constellations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;