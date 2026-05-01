import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './GlobalUI.css';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(true); // Start playing on initial load
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const videoRef = useRef(null);

  useEffect(() => {
    // When location changes, play the video transition
    if (location.pathname !== currentPath) {
      setIsPlaying(true);
      setCurrentPath(location.pathname);
    }
  }, [location.pathname, currentPath]);

  useEffect(() => {
    // Set video playback speed
    if (isPlaying && videoRef.current) {
      // Speed up by 3.0x to reduce 8s to ~2.6s
      videoRef.current.playbackRate = 3.0;
    }
  }, [isPlaying]);

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <>
      {isPlaying && (
        <div className="page-transition-overlay">
          <video
            ref={videoRef}
            src="/loading.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="page-transition-video"
          />
        </div>
      )}
      {children}
    </>
  );
};

export default PageTransition;
