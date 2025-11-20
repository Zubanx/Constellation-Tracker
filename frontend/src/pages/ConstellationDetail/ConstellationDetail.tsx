import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ConstellationDetail.css";
import observationService, {
  Observation,
} from "../../services/observationService";

interface ConstellationDetailType {
  _id: string;
  id: number;  
  name: string;
  latinName: string;
  abbreviation: string;
  season: string;
  visibility: string;
  area: number;
  brightestStar: string;
  rightAscension: string;
  declination: string;
  description: string;
  mythology: string;
  numberOfStars: number;
}

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const ConstellationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // This is MongoDB _id
  const navigate = useNavigate();
  const [constellation, setConstellation] =
    useState<ConstellationDetailType | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"info" | "observations">("info");

  useEffect(() => {
    if (id) {
      fetchConstellationDetail();
    }
  }, [id]);

  
  useEffect(() => {
    if (constellation) {
      fetchObservations();
    }
  }, [constellation]);

  const fetchConstellationDetail = async (): Promise<void> => {
    try {
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/constellations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch constellation");
      }
      const data = await response.json();
      const constellationData: ConstellationDetailType = data.data.constellation;

      console.log('🔵 Fetched constellation:', constellationData);
      console.log('🔵 Constellation numeric ID:', constellationData.id);

      setConstellation(constellationData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching constellation details:", error);
      setError("Failed to load constellation details");
      setIsLoading(false);
    }
  };

  const fetchObservations = async (): Promise<void> => {
    const token = getToken();
    if (!token || !constellation) {
      // User not logged in or no constellation data yet
      return;
    }

    // ✅ Use the numeric ID from the constellation object, NOT the URL param
    const constellationNumericId = constellation.id;

    console.log('🔵 Fetching observations for constellation ID:', constellationNumericId);

    try {
      const response = await observationService.getObservationsByConstellation(
        token,
        constellationNumericId  // ✅ This is the numeric ID (1-88)
      );
      
      console.log('✅ Fetched observations:', response.data.observations);
      setObservations(response.data.observations);
    } catch (error) {
      console.error("Error fetching observations:", error);
      // Don't set error here - observations are optional
    }
  };

  const handleLogObservation = () => {
    // ✅ Pass the numeric ID to the add observation page
    navigate(`/observations/new`, { 
      state: { 
        preSelectedConstellationId: constellation?.id 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="constellation-detail-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="container py-5 text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!constellation) {
    return (
      <div className="constellation-detail-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="container py-5 text-center">
          <h2 className="text-light mb-4">Constellation Not Found</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/constellations")}
          >
            Back to Constellations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="constellation-detail-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container py-5">
        {/* Back Button */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-outline-light"
              onClick={() => navigate("/constellations")}
            >
              ← Back to Constellations
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="detail-header">
              <div className="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                  <h1 className="constellation-title">{constellation.name}</h1>
                  <p className="constellation-latin">
                    {constellation.latinName}
                  </p>
                </div>
                <span className="constellation-badge">
                  {constellation.abbreviation}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="detail-tabs">
              <button
                className={`tab-button ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                Information
              </button>
              <button
                className={`tab-button ${
                  activeTab === "observations" ? "active" : ""
                }`}
                onClick={() => setActiveTab("observations")}
              >
                My Observations ({observations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="row mb-4">
            <div className="col-lg-8">
              {/* About */}
              <div className="info-card mb-4">
                <h3 className="card-title">About {constellation.name}</h3>
                <p className="card-text">{constellation.description}</p>
              </div>

              {/* Mythology */}
              <div className="info-card">
                <h3 className="card-title">Mythology</h3>
                <p className="card-text">
                  {constellation.mythology || "No mythology recorded."}
                </p>
              </div>
            </div>

            {/* Sidebar - Quick Facts */}
            <div className="col-lg-4">
              <div className="info-card sidebar-card">
                <h3 className="card-title">Quick Facts</h3>
                <div className="fact-item">
                  <span className="fact-label">Season</span>
                  <span className="fact-value">{constellation.season}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Visibility</span>
                  <span className="fact-value">{constellation.visibility}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Area</span>
                  <span className="fact-value">
                    {constellation.area} sq. deg.
                  </span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Brightest Star</span>
                  <span className="fact-value">
                    {constellation.brightestStar}
                  </span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Number of Stars</span>
                  <span className="fact-value">
                    {constellation.numberOfStars}
                  </span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Right Ascension</span>
                  <span className="fact-value">
                    {constellation.rightAscension}
                  </span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Declination</span>
                  <span className="fact-value">
                    {constellation.declination}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleLogObservation}
              >
                Log Observation
              </button>
            </div>
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === "observations" && (
          <div className="row">
            <div className="col-12">
              <div className="info-card">
                {observations.length === 0 ? (
                  <div className="text-center py-5">
                    <h4>No observations yet</h4>
                    <p className="text-muted mb-4">
                      Start tracking your observations of {constellation.name}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleLogObservation}
                    >
                      Log Your First Observation
                    </button>
                  </div>
                ) : (
                  <div className="observations-list">
                    {observations.map((obs) => (
                      <div key={obs._id} className="observation-item">
                        <div className="observation-header">
                          <div>
                            <h5 className="observation-date">
                              {new Date(obs.observationDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </h5>
                            <p className="observation-location">
                              <span className="location-icon">📍</span>{" "}
                              {obs.location}
                            </p>
                          </div>
                        </div>
                        {obs.notes && (
                          <p className="observation-notes">{obs.notes}</p>
                        )}
                        {obs.photoUrl && (
                          <div className="observation-photo mb-3">
                            <img
                              src={obs.photoUrl}
                              alt={`Observation of ${constellation.name}`}
                              className="img-fluid rounded"
                            />
                          </div>
                        )}
                        <div className="observation-actions">
                          <Link
                            to={`/observations/${obs._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstellationDetail;