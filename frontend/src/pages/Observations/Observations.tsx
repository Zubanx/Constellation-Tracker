import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Observations.css";
import observationService, {
  Observation,
} from "../../services/observationService";
import {
  constellationService,
  Constellation,
} from "../../services/constellationService";

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const Observations: React.FC = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [constellations, setConstellations] = useState<
    Record<number, Constellation>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filterConstellation, setFilterConstellation] = useState<string>("");
  const [sortBy, setSortBy] = useState<"observationDate" | "constellation">(
    "observationDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch both observations and constellations
      const [observationsResponse, constellationsResponse] = await Promise.all([
        observationService.getAllObservations(token, {
          sortBy: sortBy,
          order: sortOrder,
        }),
        constellationService.getAllConstellations(token),
      ]);

      setObservations(observationsResponse.data.observations);

      // Create a lookup map: constellationId -> constellation data
      const constellationMap: Record<number, Constellation> = {};
      constellationsResponse.data.constellations.forEach(
        (constellation: Constellation) => {
          constellationMap[constellation.id] = constellation;
        }
      );
      setConstellations(constellationMap);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load observations");
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when sort changes
  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [sortBy, sortOrder]);

  // Helper function to get constellation data
  const getConstellation = (constellationId: number): Constellation | null => {
    return constellations[constellationId] || null;
  };

  const getSortedAndFilteredObservations = (): Observation[] => {
    let filtered = [...observations];

    // Apply filter
    if (filterConstellation) {
      filtered = filtered.filter((obs) => {
        const constellation = getConstellation(obs.constellationId as number);
        return constellation?.name
          .toLowerCase()
          .includes(filterConstellation.toLowerCase());
      });
    }

    return filtered;
  };

  const filteredObservations = getSortedAndFilteredObservations();

  if (isLoading) {
    return (
      <div className="observations-container">
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
    <div className="observations-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="observations-title">My Observations</h1>
                <p className="observations-subtitle">
                  {observations.length}{" "}
                  {observations.length === 1 ? "observation" : "observations"}{" "}
                  recorded
                </p>
              </div>
              <Link to="/observations/new" className="btn btn-primary">
                <span className="me-2">➕</span>
                Add New Observation
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="filters-card">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Filter by Constellation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search constellation..."
                    value={filterConstellation}
                    onChange={(e) => setFilterConstellation(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "observationDate" | "constellation"
                      )
                    }
                  >
                    <option value="observationDate">Date</option>
                    <option value="constellation">Constellation</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Order</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Observations List */}
        {filteredObservations.length === 0 ? (
          <div className="text-center py-5">
            <div className="empty-state">
              <div className="empty-icon">🔭</div>
              <h3>No observations found</h3>
              <p className="text-muted mb-4">
                {filterConstellation
                  ? "Try adjusting your filter"
                  : "Start tracking your stargazing journey!"}
              </p>
              <Link to="/observations/new" className="btn btn-primary">
                Log Your First Observation
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredObservations.map((observation) => {
              const constellation = getConstellation(
                observation.constellationId as number
              );

              if (!constellation) {
                console.warn(
                  "Constellation not found for ID:",
                  observation.constellationId
                );
                return null;
              }

              return (
                <div key={observation._id} className="col-md-6 col-lg-4">
                  <div className="observation-card">
                    {observation.photoUrl && (
                      <div className="observation-image">
                        <img
                          src={observation.photoUrl}
                          alt={constellation.name}
                        />
                      </div>
                    )}

                    <div className="observation-content">
                      <div className="observation-header">
                        <h3 className="observation-constellation">
                          {constellation.name}
                        </h3>
                        <div className="observation-badge">
                          {constellation.abbreviation}
                        </div>
                      </div>

                      <div className="observation-details">
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span>
                            {new Date(
                              observation.observationDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-icon">📍</span>
                          <span>{observation.location}</span>
                        </div>

                        {constellation.hemisphere && (
                          <div className="detail-item">
                            <span className="detail-icon">🌍</span>
                            <span>{constellation.hemisphere}</span>
                          </div>
                        )}
                      </div>

                      {observation.notes && (
                        <div className="observation-notes">
                          <p>{observation.notes}</p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Observations;
