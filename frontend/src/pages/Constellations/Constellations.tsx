import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Constellations.css";

interface Constellation {
  id: string;
  name: string;
  latinName: string;
  abbreviation: string;
  season: string;
  area: number;
  brightestStar: string;
}

const Constellations: React.FC = () => {
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [filteredConstellations, setFilteredConstellations] = useState<
    Constellation[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");

  useEffect(() => {
    fetchConstellations();
  }, []);

  useEffect(() => {
    filterConstellations();
  }, [searchQuery, selectedSeason, constellations]);

  const fetchConstellations = async (): Promise<void> => {
    try {
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/constellations`);

      if (!response.ok) {
        throw new Error("Failed to fetch constellations");
      }

      const data = await response.json();
      const constellations: Constellation[] = data.data.constellations;
      console.log("Fetched constellations:", constellations);
      setConstellations(constellations);
      setFilteredConstellations(constellations);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching constellations:", error);
      setIsLoading(false);
    }
  };

  const filterConstellations = (): void => {
    let filtered = [...constellations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Season filter
    if (selectedSeason !== "all") {
      filtered = filtered.filter(
        (c) => c.season.toLowerCase() === selectedSeason.toLowerCase()
      );
    }

    setFilteredConstellations(filtered);
  };

  const resetFilters = (): void => {
    setSearchQuery("");
    setSelectedSeason("all");
  };

  if (isLoading) {
    return (
      <div className="constellations-container">
        <div className="container py-5 text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="constellations-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container py-5">
        {/* Header */}
        <div className="row mb-5 text-center">
          <div className="col-12">
            <h1 className="page-title">Explore Constellations</h1>
            <p className="page-subtitle">
              Discover all 88 recognized constellations and track your
              observations
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="filters-card">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or abbreviation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                  >
                    <option value="all">All Seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-outline-light w-100"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="row mb-3">
          <div className="col-12">
            <p className="results-count">
              Showing {filteredConstellations.length} of {constellations.length}{" "}
              constellations
            </p>
          </div>
        </div>

        {/* Grid */}
        {filteredConstellations.length === 0 ? (
          <div className="text-center text-light">
            <h3>No constellations found</h3>
            <p>Try adjusting your filters or search query</p>
            <button className="btn btn-primary" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredConstellations.map((c) => (
              <div key={c.id} className="col-md-6 col-lg-4">
                <Link
                  to={`/constellations/${c.id}`}
                  className="constellation-card-link"
                >
                  <div className="constellation-card">
                    <div className="constellation-header">
                      <h3 className="constellation-name">{c.name}</h3>
                      <span className="constellation-abbr">
                        {c.abbreviation}
                      </span>
                    </div>
                    <div className="constellation-body">
                      <div className="constellation-info">
                        <span className="info-label">Latin Name:</span>
                        <span className="info-value">{c.latinName}</span>
                      </div>
                      <div className="constellation-info">
                        <span className="info-label">Season:</span>
                        <span className="info-value">{c.season}</span>
                      </div>
                      <div className="constellation-info">
                        <span className="info-label">Brightest Star:</span>
                        <span className="info-value">{c.brightestStar}</span>
                      </div>
                      <div className="constellation-info">
                        <span className="info-label">Area:</span>
                        <span className="info-value">{c.area} sq. deg.</span>
                      </div>
                    </div>
                    <div className="constellation-footer">
                      <span className="view-details">View Details →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Constellations;
