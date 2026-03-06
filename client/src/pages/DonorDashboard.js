import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { foodAPI } from '../utils/api';
import MapComponent from '../components/MapComponent';
import './Dashboard.css';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    preparedAt: '',
    expiryTime: '',
    pickupLocation: {
      address: '',
      coordinates: { lat: '', lng: '' },
    },
    notes: '',
  });

  useEffect(() => {
    fetchDonations();
    // Auto-refresh every 30 seconds for tracking
    const interval = setInterval(fetchDonations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await foodAPI.getDonorDonations();
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Expiry time must be after prepared time
    if (new Date(formData.expiryTime) <= new Date(formData.preparedAt)) {
      alert('Expiry time must be later than the preparation time.');
      return;
    }

    try {
      await foodAPI.create(formData);
      setShowForm(false);
      setFormData({
        foodType: '',
        quantity: '',
        preparedAt: '',
        expiryTime: '',
        pickupLocation: { address: '', coordinates: { lat: '', lng: '' } },
        notes: '',
      });
      fetchDonations();
      alert('Donation created successfully!');
    } catch (error) {
      alert(error.response?.data?.msg || 'Error creating donation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      accepted: '#2196f3',
      picked: '#9c27b0',
      delivered: '#4caf50',
      rejected: '#f44336',
    };
    return colors[status] || '#666';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Savour Meals <span className="role-badge">Donor</span></h1>
          <p className="welcome-text">Welcome back, {user.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">
          <span className="icon">🚪</span> Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="action-bar">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`btn-primary ${showForm ? 'active' : ''}`}
          >
            {showForm ? '✖ Cancel' : '+ Create New Donation'}
          </button>
        </div>

        {showForm && (
          <div className="form-card slide-down">
            <h2>🍜 Share a Meal</h2>
            <p className="form-subtitle">Fill in the details to donate food.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Food Item</label>
                  <input
                    type="text"
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    placeholder="e.g., Ven Pongal, Curd Rice"
                    required
                    className="modern-input"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity (Servings)</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    min="1"
                    required
                    className="modern-input"
                  />
                </div>
                <div className="form-group">
                  <label>Prepared At</label>
                  <input
                    type="datetime-local"
                    value={formData.preparedAt}
                    onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                    required
                    className="modern-input"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Time</label>
                  <input
                    type="datetime-local"
                    value={formData.expiryTime}
                    min={formData.preparedAt}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                    required
                    className="modern-input"
                  />
                  <small className="hint-text">Must be after preparation time.</small>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Pickup Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    value={formData.pickupLocation.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupLocation: { ...formData.pickupLocation, address: e.target.value },
                      })
                    }
                    placeholder="Enter full address for pickup"
                    required
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notes / Instructions (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="modern-input"
                  placeholder="Any specific packing instructions or landmarks..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  🚀 Submit Donation
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="donations-section">
          <div className="section-header">
            <h2>Your Contributions</h2>
            <button onClick={fetchDonations} className="btn-icon" title="Refresh">
              🔄
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : donations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍲</div>
              <h3>No donations yet</h3>
              <p>Your journey to ending hunger starts here. Create a donation above!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {donations.map((donation) => {
                const showMap = ['accepted', 'picked', 'in_transit'].includes(donation.status);
                const delivery = donation.delivery;
                const volunteerLoc = delivery?.currentLocation;

                // Construct markers for map
                const markers = [];
                if (donation.pickupLocation?.coordinates?.lat) {
                  markers.push({
                    lat: donation.pickupLocation.coordinates.lat,
                    lng: donation.pickupLocation.coordinates.lng,
                    popup: 'Pickup Location',
                    type: 'pickup'
                  });
                }
                if (volunteerLoc && volunteerLoc.lat) {
                  markers.push({
                    lat: volunteerLoc.lat,
                    lng: volunteerLoc.lng,
                    popup: 'Volunteer',
                    type: 'volunteer'
                  });
                }

                return (
                  <div key={donation._id} className="card donation-card">
                    <div className="card-header">
                      <span className={`status-pill ${donation.status}`}>
                        {donation.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="date-badge">
                        {new Date(donation.preparedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="card-body">
                      <h3 className="food-title">{donation.foodType}</h3>

                      <div className="card-details">
                        <div className="detail-item">
                          <span className="emoji">👥</span>
                          <span>{donation.quantity} servings</span>
                        </div>
                        <div className="detail-item">
                          <span className="emoji">⏰</span>
                          <span>Expires: {new Date(donation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {donation.ngoId && (
                        <div className="ngo-info">
                          <strong>Accepted by:</strong> {donation.ngoId.name || donation.ngoId.organizationName}
                        </div>
                      )}

                      {delivery && (
                        <div className="delivery-card">
                          <div className="volunteer-row">
                            <div className="volunteer-avatar">👤</div>
                            <div>
                              <p className="volunteer-name">{donation.volunteerId?.name}</p>
                              <p className="volunteer-role">Volunteer</p>
                            </div>
                            <a href={`tel:${donation.volunteerId?.phone}`} className="phone-btn">📞</a>
                          </div>
                        </div>
                      )}

                      {donation.pickupOtp && (
                        <div className="otp-box" style={{ marginTop: '15px' }}>
                          <span className="otp-label">PICKUP OTP</span>
                          <span className="otp-value">{donation.pickupOtp}</span>
                        </div>
                      )}

                      {showMap && markers.length > 0 && (
                        <div className="map-wrapper">
                          <MapComponent
                            center={volunteerLoc || markers[0]}
                            markers={markers}
                            zoom={13}
                          />
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <p className="location-text">📍 {donation.pickupLocation?.address}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

