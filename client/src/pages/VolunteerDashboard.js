import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerAPI, routingAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import MapComponent from '../components/MapComponent';
import DeliveryProgressBar from '../components/DeliveryProgressBar';
import './Dashboard.css';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStates, setMapStates] = useState({});
  const [routeInfo, setRouteInfo] = useState({});
  const [routeLoading, setRouteLoading] = useState({});
  
  // Custom OTP Modal state
  const [otpModal, setOtpModal] = useState({ isOpen: false, taskId: null });
  const [otpValue, setOtpValue] = useState('');

  // Delivery OTP Modal state (4-digit for confirming delivery to NGO)
  const [deliveryOtpModal, setDeliveryOtpModal] = useState({ isOpen: false, taskId: null });
  const [deliveryOtpValue, setDeliveryOtpValue] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await volunteerAPI.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status, currentLocation = null, otp = null) => {
    if (status === 'picked' && !otp) {
      setOtpModal({ isOpen: true, taskId });
      return; 
    }

    if (status === 'delivered' && !otp) {
      setDeliveryOtpModal({ isOpen: true, taskId });
      return;
    }

    try {
      await volunteerAPI.updateTaskStatus(taskId, status, currentLocation, otp);
      fetchTasks();
      if (!currentLocation) {
        toast.success(`Status updated to ${status.replace('_', ' ').toUpperCase()}`);
      }
      setOtpModal({ isOpen: false, taskId: null });
      setOtpValue('');
      setDeliveryOtpModal({ isOpen: false, taskId: null });
      setDeliveryOtpValue('');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error updating status');
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otpValue.trim()) {
      updateStatus(otpModal.taskId, 'picked', null, otpValue.trim());
    }
  };

  const handleDeliveryOtpSubmit = (e) => {
    e.preventDefault();
    if (deliveryOtpValue.trim()) {
      updateStatus(deliveryOtpModal.taskId, 'delivered', null, deliveryOtpValue.trim());
    }
  };

  const handleShareLocation = (task) => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { lat: latitude, lng: longitude };

        setMapStates(prev => ({
          ...prev,
          [task._id]: {
            ...prev[task._id],
            center: currentLocation,
            markers: [
              ...(prev[task._id]?.markers || []).filter(m => m.type !== 'volunteer'),
              { lat: latitude, lng: longitude, popup: 'My Location', type: 'volunteer' }
            ]
          }
        }));

        await updateStatus(task._id, task.status, currentLocation);
        toast.success('Location shared successfully!');
      },
      (error) => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  const handleGetRoute = async (task) => {
    const donationId = task.donationId?._id || task.donationId;
    setRouteLoading(prev => ({ ...prev, [task._id]: true }));
    try {
      const response = await routingAPI.getRoute(donationId);
      setRouteInfo(prev => ({ ...prev, [task._id]: response.data.route }));
    } catch (error) {
      const msg = error.response?.data?.msg || 'Unable to compute route. Share your location first.';
      toast.error(msg);
    } finally {
      setRouteLoading(prev => ({ ...prev, [task._id]: false }));
    }
  };

  const handleSearchLocation = async (taskId, address) => {
    try {
      if (!address) return;

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const location = { lat: parseFloat(lat), lng: parseFloat(lon) };

        setMapStates(prev => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            center: location,
            markers: [
              ...(prev[taskId]?.markers || []).filter(m => m.type === 'volunteer'),
              { lat: location.lat, lng: location.lng, popup: address, type: 'destination' }
            ]
          }
        }));
      } else {
        toast.warning('Location not found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Error searching location');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Savour Meals <span className="role-badge" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>Volunteer</span></h1>
          <p className="welcome-text">Welcome, {user.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="donations-list">
          <h2>My Assigned Tasks</h2>
          {loading ? (
            <div>Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks assigned at the moment.</div>
          ) : (
            <div className="cards-grid">
              {tasks.map((task) => {
                const donation = task.donationId;
                const mapState = mapStates[task._id] || {};

                return (
                  <div key={task._id} className="card volunteer-card">
                    <div className="card-header">
                      <h3>{donation?.foodType}</h3>
                      <span className={`status-badge status-${task.status}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Progress Stepper */}
                    <DeliveryProgressBar status={task.status} />

                    <div className="card-body">
                      {/* Map Section */}
                      <div className="map-section">
                        {mapState.markers && (
                          <div className="map-wrapper" style={{ height: '300px', marginBottom: '15px' }}>
                            <MapComponent
                              center={mapState.center}
                              markers={mapState.markers}
                              zoom={15}
                            />
                          </div>
                        )}
                        <div className="map-controls" style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleSearchLocation(task._id, task.deliveryAddress)}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                          >
                            Show Delivery Location
                          </button>
                          <button
                            onClick={() => handleShareLocation(task)}
                            className="btn-secondary"
                            style={{ flex: 1, background: '#4299E1', color: 'white' }}
                          >
                            Share My Location
                          </button>
                        </div>
                        <small style={{ display: 'block', textAlign: 'center', color: '#718096', marginBottom: '15px' }}>
                          *Click "Show Delivery Location" to view the destination on the map above.
                        </small>

                        {/* Route Info */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                          <button
                            onClick={() => handleGetRoute(task)}
                            className="btn-secondary"
                            style={{ flex: 1, background: '#059669', color: 'white' }}
                            disabled={routeLoading[task._id]}
                          >
                            {routeLoading[task._id] ? 'Computing...' : 'Get Route & ETA'}
                          </button>
                        </div>

                        {routeInfo[task._id] && (
                          <div style={{ 
                            display: 'flex', gap: '16px', padding: '14px 18px', 
                            background: 'rgba(5, 150, 105, 0.08)', borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(5, 150, 105, 0.15)', marginBottom: '15px'
                          }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                                {routeInfo[task._id].distance} km
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</div>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(5, 150, 105, 0.2)' }} />
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                                {routeInfo[task._id].duration} min
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Time</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="info-grid">
                        <div className="info-item">
                          <label>Quantity</label>
                          <p>{donation?.quantity} people</p>
                        </div>
                        <div className="info-item">
                          <label>Donor</label>
                          <p>{donation?.donorId?.name}</p>
                          <a href={`tel:${donation?.donorId?.phone}`} className="phone-link">{donation?.donorId?.phone}</a>
                        </div>
                        <div className="info-item full-width">
                          <label>Pickup Location</label>
                          <p>{donation?.pickupLocation?.address}</p>
                        </div>
                        <div className="info-item full-width">
                          <label>Delivery Address</label>
                          <p>{task.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="card-actions">
                        {task.status === 'assigned' && (
                          <button onClick={() => updateStatus(task._id, 'picked')} className="btn-primary full-width">
                            Mark as Picked Up
                          </button>
                        )}
                        {task.status === 'picked' && (
                          <button onClick={() => updateStatus(task._id, 'in_transit')} className="btn-warning full-width">
                            Start Delivery (In Transit)
                          </button>
                        )}
                        {task.status === 'in_transit' && (
                          <button onClick={() => updateStatus(task._id, 'delivered')} className="btn-success full-width">
                            Confirm Delivery
                          </button>
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

      {/* Pickup OTP Modal (6-digit from Donor) */}
      {otpModal.isOpen && (
        <div className="modal otp-modal">
          <div className="modal-content">
            <h2>Enter Pickup OTP</h2>
            <p className="form-subtitle">Please enter the 6-digit OTP provided by the Donor to confirm you have picked up the food.</p>
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="e.g. 849204"
                  className="modern-input otp-input"
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Verify & Pick Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpModal({ isOpen: false, taskId: null });
                    setOtpValue('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery OTP Modal (4-digit to confirm delivery to NGO) */}
      {deliveryOtpModal.isOpen && (
        <div className="modal otp-modal">
          <div className="modal-content">
            <h2>Enter Delivery OTP</h2>
            <p className="form-subtitle">Please enter the 4-digit OTP provided by the NGO to confirm the food has been delivered successfully.</p>
            <form onSubmit={handleDeliveryOtpSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={deliveryOtpValue}
                  onChange={(e) => setDeliveryOtpValue(e.target.value)}
                  placeholder="e.g. 4829"
                  className="modern-input otp-input"
                  required
                  autoFocus
                  maxLength={4}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-success">
                  Confirm Delivery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryOtpModal({ isOpen: false, taskId: null });
                    setDeliveryOtpValue('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VolunteerDashboard;
