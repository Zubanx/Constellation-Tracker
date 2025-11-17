import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { observationService } from '../../services/observationService';
import { constellationService, Constellation } from '../../services/constellationService';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUploads';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Observations.css';

const AddObservation: React.FC = () => {
  const { id: preSelectedConstellationId } = useParams<{ id?: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { uploadImage, isUploading: isUploadingImage } = useCloudinaryUpload();

  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [isLoadingConstellations, setIsLoadingConstellations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    constellationId: preSelectedConstellationId || '',
    location: '',
    notes: '',
    observationDate: new Date().toISOString().split('T')[0], // Today's date
    photoUrl: '',
    cloudinaryPublicId: ''
  });

  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');

  useEffect(() => {
    fetchConstellations();
  }, []);

  useEffect(() => {
    if (preSelectedConstellationId) {
      setFormData(prev => ({ ...prev, constellationId: preSelectedConstellationId }));
    }
  }, [preSelectedConstellationId]);

  const fetchConstellations = async () => {
    if (!token) return;

    try {
      setIsLoadingConstellations(true);
      const { constellations } = await constellationService.getAllConstellations(token);
      setConstellations(constellations.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error fetching constellations:', err);
      setError('Failed to load constellations');
    } finally {
      setIsLoadingConstellations(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async () => {
    try {
      const result = await uploadImage();
      if (result) {
        setFormData(prev => ({
          ...prev,
          photoUrl: result.secure_url,
          cloudinaryPublicId: result.publicId
        }));
        setUploadedImagePreview(result.secure_url);
        setError('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      photoUrl: '',
      cloudinaryPublicId: ''
    }));
    setUploadedImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.constellationId) {
      setError('Please select a constellation');
      return;
    }

    if (!formData.location.trim()) {
      setError('Please enter a location');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setIsSubmitting(true);

      const observationData = {
        constellationId: formData.constellationId,
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        observationDate: formData.observationDate,
        ...(formData.photoUrl && {
          photoUrl: formData.photoUrl,
          cloudinaryPublicId: formData.cloudinaryPublicId
        })
      };

      const result = await observationService.addObservation(token, observationData);

      setSuccess(true);

      // Show success message
      if (result.firstTime) {
        alert(`🎉 Congratulations! This is your first observation of this constellation!`);
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate(`/constellations/${formData.constellationId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error adding observation:', err);
      setError(err.message || 'Failed to add observation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingConstellations) {
    return (
      <div className="add-observation-container">
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
    <div className="add-observation-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="observation-form-card">
              <h1 className="form-title">
                <span className="title-icon">✨</span>
                Log New Observation
              </h1>
              <p className="form-subtitle">
                Record your celestial discovery
              </p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  Observation added successfully! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Constellation Selection */}
                <div className="mb-4">
                  <label htmlFor="constellationId" className="form-label">
                    Constellation *
                  </label>
                  <select
                    id="constellationId"
                    name="constellationId"
                    className="form-select"
                    value={formData.constellationId}
                    onChange={handleInputChange}
                    required
                    disabled={!!preSelectedConstellationId}
                  >
                    <option value="">Select a constellation...</option>
                    {constellations.map(constellation => (
                      <option key={constellation._id} value={constellation._id}>
                        {constellation.name} ({constellation.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="form-label">Photo</label>
                  {uploadedImagePreview ? (
                    <div className="uploaded-image-container">
                      <img 
                        src={uploadedImagePreview} 
                        alt="Uploaded observation" 
                        className="uploaded-image"
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mt-2"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-upload"
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <span className="upload-icon">📷</span>
                          Upload Photo
                        </>
                      )}
                    </button>
                  )}
                  <small className="form-text">Optional: Add a photo of your observation</small>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label htmlFor="location" className="form-label">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="e.g., Orlando, FL"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Observation Date */}
                <div className="mb-4">
                  <label htmlFor="observationDate" className="form-label">
                    Observation Date *
                  </label>
                  <input
                    type="date"
                    id="observationDate"
                    name="observationDate"
                    className="form-control"
                    value={formData.observationDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label htmlFor="notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows={4}
                    placeholder="Add any notes about your observation (weather conditions, visibility, etc.)"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="me-2">💫</span>
                        Log Observation
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddObservation;