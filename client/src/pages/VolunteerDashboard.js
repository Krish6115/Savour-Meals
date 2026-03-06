import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerAPI } from '../utils/api';
import MapComponent from '../components/MapComponent';
import './Dashboard.css';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStates, setMapStates] = useState({}); // Store map state for each task

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

  const updateStatus = async (taskId, status, currentLocation = null) => {
    let otp = null;

    if (status === 'picked') {
      otp = prompt('Please enter the Pickup OTP provided by the Donor:');
      if (!otp) return; // Cancel if no OTP entered
    }

    try {
      await volunteerAPI.updateTaskStatus(taskId, status, currentLocation, otp);
      fetchTasks();
      if (!currentLocation) {
        alert(`Status updated to ${status.replace('_', ' ').toUpperCase()}`);
      }
    } catch (error) {
      alert(error.response?.data?.msg || 'Error updating status');
    }
  };

  const handleShareLocation = (task) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { lat: latitude, lng: longitude };

        // Update map for this task
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

        // Send to backend (using current status to just update location)
        await updateStatus(task._id, task.status, currentLocation);
        alert('Location shared successfully!');
      },
      (error) => {
        alert('Unable to retrieve your location');
      }
    );
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
              ...(prev[taskId]?.markers || []).filter(m => m.type === 'volunteer'), // Keep volunteer marker
              { lat: location.lat, lng: location.lng, popup: address, type: 'destination' }
            ]
          }
        }));
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Savour Meals - Volunteer Dashboard</h1>
          <p>Welcome, {user.name}!</p>
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
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
                    <div className="stepper">
                      {['assigned', 'picked', 'in_transit', 'delivered'].map((step, index) => {
                        const statuses = ['assigned', 'picked', 'in_transit', 'delivered'];
                        const currentIdx = statuses.indexOf(task.status);
                        const stepIdx = statuses.indexOf(step);
                        const isActive = stepIdx <= currentIdx;

                        return (
                          <div key={step} className={`step ${isActive ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <span className="step-label">{step.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>

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
                            📍 Show Delivery Location
                          </button>
                          <button
                            onClick={() => handleShareLocation(task)}
                            className="btn-secondary"
                            style={{ flex: 1, background: '#4299E1', color: 'white' }}
                          >
                            📡 Share My Location
                          </button>
                        </div>
                        <small style={{ display: 'block', textAlign: 'center', color: '#718096', marginBottom: '15px' }}>
                          *Click "Show Delivery Location" to view the destination on the map above.
                        </small>
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
                            Mark as Picked
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
    </div>
  );
};

export default VolunteerDashboard;

