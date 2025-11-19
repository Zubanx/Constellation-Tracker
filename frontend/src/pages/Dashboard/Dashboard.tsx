import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import observationService from "../../services/observationService";
import { constellationService, Constellation } from "../../services/constellationService";

interface UserStats {
  totalObservations: number;
  constellationsTracked: number;
  favoriteConstellation: string;
  lastObservationDate: string;
}

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    totalObservations: 0,
    constellationsTracked: 0,
    favoriteConstellation: "Loading...",
    lastObservationDate: "N/A",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Fetch both observations AND constellations
      const [observations, constellationsResponse] = await Promise.all([
        observationService.getRecentObservations(token, 100), // Get all observations for accurate stats
        constellationService.getAllConstellations(token),
      ]);

      
      const constellationMap: Record<number, Constellation> = {};
      constellationsResponse.data.constellations.forEach(
        (constellation: Constellation) => {
          constellationMap[constellation.id] = constellation;
        }
      );

      // Calculate stats from observations
      if (observations.length > 0) {
        // ✅ Get unique constellation IDs (numeric)
        const uniqueConstellationIds = new Set(
          observations.map((obs) => obs.constellationId)
        );

        // ✅ Find favorite constellation (most observed)
        const constellationCounts: Record<number, { name: string; count: number }> = {};
        
        observations.forEach((obs) => {
          const constId = obs.constellationId as number;
          const constellation = constellationMap[constId];
          
          if (constellation) {
            if (constellationCounts[constId]) {
              constellationCounts[constId].count++;
            } else {
              constellationCounts[constId] = {
                name: constellation.name,
                count: 1,
              };
            }
          }
        });

        // Find constellation with highest count
        const favoriteConst = Object.values(constellationCounts).reduce(
          (max, current) => (current.count > max.count ? current : max),
          { name: "None", count: 0 }
        );

        // Get last observation date
        const lastDate = observations[0].observationDate; // Already sorted by date (desc)

        setStats({
          totalObservations: observations.length,
          constellationsTracked: uniqueConstellationIds.size,
          favoriteConstellation: favoriteConst.name,
          lastObservationDate: lastDate,
        });
      } else {
        // No observations yet
        setStats({
          totalObservations: 0,
          constellationsTracked: 0,
          favoriteConstellation: "None yet",
          lastObservationDate: "N/A",
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
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
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

        {/* Progress Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="progress-card">
              <h3 className="section-heading mb-4">Your Progress</h3>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Constellations Discovered</span>
                  <span>
                    {stats.constellationsTracked}/88
                  </span>
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