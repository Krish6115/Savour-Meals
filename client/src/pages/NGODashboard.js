import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { foodAPI, ngoAPI } from '../utils/api';
import './Dashboard.css';

const NGODashboard = () => {
  const { user, logout } = useAuth();
  const [pendingDonations, setPendingDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [assignForm, setAssignForm] = useState({ volunteerId: '', deliveryAddress: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsRes, volunteersRes] = await Promise.all([
        ngoAPI.getRequests(),
        ngoAPI.getVolunteers(),
      ]);
      setPendingDonations(donationsRes.data.requests);
      setVolunteers(volunteersRes.data.volunteers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (donationId) => {
    try {
      await foodAPI.accept(donationId);
      fetchData();
      alert('Donation accepted successfully!');
    } catch (error) {
      alert(error.response?.data?.msg || 'Error accepting donation');
    }
  };

  const handleReject = async (donationId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await foodAPI.reject(donationId, reason);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.msg || 'Error rejecting donation');
      }
    }
  };

  const handleAssignVolunteer = async (e) => {
    e.preventDefault();
    try {
      await ngoAPI.assignVolunteer(selectedDonation, assignForm.volunteerId, assignForm.deliveryAddress);
      setSelectedDonation(null);
      setAssignForm({ volunteerId: '', deliveryAddress: '' });
      fetchData();
      alert('Volunteer assigned successfully!');
    } catch (error) {
      alert(error.response?.data?.msg || 'Error assigning volunteer');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Savour Meals - NGO Dashboard</h1>
          <p>Welcome, {user.organizationName || user.name}!</p>
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        {/* Section 1: Nearby Requests (Pending) */}
        <div className="section-container">
          <h2>Nearby Requests</h2>
          {loading ? (
            <div>Loading...</div>
          ) : pendingDonations.filter(d => d.status === 'pending').length === 0 ? (
            <div className="empty-state">No pending requests nearby.</div>
          ) : (
            <div className="cards-grid">
              {pendingDonations.filter(d => d.status === 'pending').map((donation) => (
                <div key={donation._id} className="card pending-card">
                  <div className="card-header">
                    <h3>{donation.foodType}</h3>
                    <span className="status-badge status-pending">PENDING</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Quantity:</strong> {donation.quantity} people</p>
                    <p><strong>Location:</strong> {donation.pickupLocation?.address}</p>
                    <p><strong>Prepared:</strong> {new Date(donation.preparedAt).toLocaleString()}</p>
                    <p><strong>Expires:</strong> {new Date(donation.expiryTime).toLocaleString()}</p>
                    <div className="card-actions">
                      <button onClick={() => handleAccept(donation._id)} className="btn-success">Accept</button>
                      <button onClick={() => handleReject(donation._id)} className="btn-danger">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Deliveries (Accepted/Assigned) */}
        <div className="section-container">
          <h2>Active Deliveries</h2>
          {loading ? (
            <div>Loading...</div>
          ) : pendingDonations.filter(d => d.status !== 'pending').length === 0 ? (
            <div className="empty-state">No active deliveries.</div>
          ) : (
            <div className="cards-grid">
              {pendingDonations.filter(d => d.status !== 'pending').map((donation) => (
                <div key={donation._id} className={`card status-${donation.status}`}>
                  <div className="card-header">
                    <h3>{donation.foodType}</h3>
                    <span className={`status-badge status-${donation.status}`}>
                      {donation.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Quantity:</strong> {donation.quantity} people</p>
                    <p><strong>Donor:</strong> {donation.donorId?.name} ({donation.donorId?.phone})</p>
                    <p><strong>Pickup:</strong> {donation.pickupLocation?.address}</p>

                    {donation.volunteerId ? (
                      <div className="volunteer-info">
                        <p><strong>Volunteer:</strong> {donation.volunteerId.name}</p>
                        <p><strong>Contact:</strong> {donation.volunteerId.phone}</p>
                      </div>
                    ) : (
                      <div className="volunteer-needed">
                        <p>⚠️ Volunteer needed</p>
                      </div>
                    )}

                    <div className="card-actions">
                      {donation.status === 'accepted' && (
                        <button onClick={() => setSelectedDonation(donation._id)} className="btn-primary">
                          Assign Volunteer
                        </button>
                      )}

                      {/* Show delivery status for tracking */}
                      {['picked', 'delivered'].includes(donation.status) && (
                        <button className="btn-secondary" disabled>
                          Track Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDonation && (
          <div className="modal">
            <div className="modal-content">
              <h2>Assign Volunteer</h2>
              <form onSubmit={handleAssignVolunteer}>
                <div className="form-group">
                  <label>Select Volunteer</label>
                  <select
                    value={assignForm.volunteerId}
                    onChange={(e) => setAssignForm({ ...assignForm, volunteerId: e.target.value })}
                    required
                  >
                    <option value="">Choose a volunteer...</option>
                    {volunteers.map((volunteer) => (
                      <option key={volunteer._id} value={volunteer._id}>
                        {volunteer.name} - {volunteer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    value={assignForm.deliveryAddress}
                    onChange={(e) => setAssignForm({ ...assignForm, deliveryAddress: e.target.value })}
                    placeholder="Enter delivery address"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Assign</button>
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
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
    </div>
  );
};

export default NGODashboard;

