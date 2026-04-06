import React from 'react';
import './DeliveryProgressBar.css';

const DeliveryProgressBar = ({ status }) => {
  const stages = ['pending', 'accepted', 'picked', 'in_transit', 'delivered'];
  let currentIndex = stages.indexOf(status);

  // If status is "assigned" (not strictly in stages), we count it as "accepted" for progress representation 
  if (status === 'assigned') {
    currentIndex = 1;
  }
  
  if(currentIndex === -1 && status !== 'rejected') {
      currentIndex = 0;
  }

  // Calculate percentage to fill the line
  const fillPercentage = currentIndex > 0 ? (currentIndex / (stages.length - 1)) * 100 : 0;

  return (
    <div className="delivery-progress-container">
      <div className="progress-bar-background">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${fillPercentage}%`, visibility: status === 'rejected' ? 'hidden' : 'visible' }}
        ></div>
      </div>
      
      <div className="progress-stages">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          let label = stage;
          if (stage === 'in_transit') label = 'in transit';

          return (
            <div key={stage} className={`progress-stage ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="stage-dot"></div>
              <span className="stage-label">{label.toUpperCase()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryProgressBar;
