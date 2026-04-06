import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DonorDashboard from './DonorDashboard';
import NGODashboard from './NGODashboard';
import VolunteerDashboard from './VolunteerDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'donor':
      return <DonorDashboard />;
    case 'ngo':
      return <NGODashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Dashboard;

