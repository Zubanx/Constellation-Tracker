import React, { useState, useEffect, JSX } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ConstellationDetail.css';

interface ConstellationDetailType {
  id: string;
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
  // borderConstellations removed
}

interface Observation {
  id: string;
  date: string;
  location: string;
  rating: number;
  notes: string;
}

const ConstellationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [constellation, setConstellation] = useState<ConstellationDetailType | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'info' | 'observations'>('info');

  useEffect(() => {
    fetchConstellationDetail();
    fetchObservations();
  }, [id]);

  const fetchConstellationDetail = async (): Promise<void> => {
    try {
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/constellations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch constellation");
      }
      const data = await response.json();
      const constellation: ConstellationDetailType = data.data.constellation;

      setConstellation(constellation);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching constellation details:', error);
      setIsLoading(false);
    }
  };

  const fetchObservations = async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockObservations: Observation[] = [
        {
          id: '1',
          date: '2024-11-15',
          location: 'Orlando, FL',
          rating: 5,
          notes: 'Clear sky, perfect visibility. Orion\'s Belt was stunning.'
        },
        {
          id: '2',
          date: '2024-01-20',
          location: 'Orlando, FL',
          rating: 4,
          notes: 'Some light pollution but still very visible.'
        }
      ];

      setObservations(mockObservations);
    } catch (error) {
      console.error('Error fetching observations:', error);
    }
  };

  const renderStars = (rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="constellation-detail-container">
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
        <div className="container py-5 text-center">
          <h2 className="text-light mb-4">Constellation Not Found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/constellations')}>
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
            <button className="btn btn-outline-light" onClick={() => navigate('/constellations')}>
              ← Back to Constellations
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="detail-header">
              <div className="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                  <h1 className="constellation-title">{constellation.name}</h1>
                  <p className="constellation-latin">{constellation.latinName}</p>
                </div>
                <span className="constellation-badge">{constellation.abbreviation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="detail-tabs">
              <button
                className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Information
              </button>
              <button
                className={`tab-button ${activeTab === 'observations' ? 'active' : ''}`}
                onClick={() => setActiveTab('observations')}
              >
                My Observations ({observations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
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
                <p className="card-text">{constellation.mythology || 'No mythology recorded.'}</p>
              </div>
              {/* Bordering Constellations section completely removed */}
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
                  <span className="fact-value">{constellation.area} sq. deg.</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Brightest Star</span>
                  <span className="fact-value">{constellation.brightestStar}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Number of Stars</span>
                  <span className="fact-value">{constellation.numberOfStars}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Right Ascension</span>
                  <span className="fact-value">{constellation.rightAscension}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Declination</span>
                  <span className="fact-value">{constellation.declination}</span>
                </div>
              </div>

              <button className="btn btn-primary w-100 mt-3">
                Log Observation
              </button>
            </div>
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="row">
            <div className="col-12">
              <div className="info-card">
                {observations.length === 0 ? (
                  <div className="text-center py-5">
                    <h4>No observations yet</h4>
                    <p className="text-muted mb-4">
                      Start tracking your observations of {constellation.name}
                    </p>
                    <button className="btn btn-primary">Log Your First Observation</button>
                  </div>
                ) : (
                  <div className="observations-list">
                    {observations.map((obs) => (
                      <div key={obs.id} className="observation-item">
                        <div className="observation-header">
                          <div>
                            <h5 className="observation-date">
                              {new Date(obs.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h5>
                            <p className="observation-location">Location: {obs.location}</p>
                          </div>
                          <div className="observation-rating">{renderStars(obs.rating)}</div>
                        </div>
                        <p className="observation-notes">{obs.notes}</p>
                        <div className="observation-actions">
                          <Link to={`/observations/${obs.id}`} className="btn btn-sm btn-outline-primary">
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