import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
const config = require('../../../../config.js');

mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;

const MovementCompanion = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runData, setRunData] = useState({
    time: 0,
    distance: 0,
    currentPace: 0,
    averagePace: 0,
    path: [],
  });
  const [reviewMode, setReviewMode] = useState(false);
  const [view, setView] = useState('initial');
  const [locationPermission, setLocationPermission] = useState('prompt');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const watchId = useRef(null);
  const startTime = useRef(null);
  const intervalId = useRef(null);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [0, 0],
        zoom: 2,
        attributionControl: false
      });

      // Add geolocate control to the map
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.current.addControl(geolocate);

      // Function to handle geolocation and zooming
      const handleGeolocate = (e) => {
        const lon = e.coords.longitude;
        const lat = e.coords.latitude;
        const zoom = 15;

        map.current.flyTo({
          center: [lon, lat],
          zoom: zoom,
          speed: 1.5,
          curve: 1,
          easing(t) {
            return t;
          }
        });
      };

      // Trigger geolocation on map load
      map.current.on('load', () => {
        geolocate.trigger();
      });
      
      // Listen for the 'geolocate' event
      geolocate.on('geolocate', handleGeolocate);
    }
    checkLocationPermission();
  }, []);


  const checkLocationPermission = () => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        result.onchange = () => {
          setLocationPermission(result.state);
        };
      });
    } else {
      // Fallback for browsers that don't support the Permissions API
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission('granted'),
        () => setLocationPermission('denied')
      );
    }
  };

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission('granted'),
      () => setLocationPermission('denied')
    );
  };

  const startRun = () => {
    if (locationPermission === 'granted') {
      setIsRunning(true);
      setView('running');
      startTime.current = Date.now();
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updatePosition(position);
          
          // Zoom to user's location
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              speed: 1.5,
              curve: 1,
              easing(t) {
                return t;
              }
            });
          }
        },
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
      intervalId.current = setInterval(updateTime, 1000);
    } else {
      alert('Location permission is required to start a run. Please enable location services and try again.');
      requestLocationPermission();
    }
  };

  const pauseRun = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      clearInterval(intervalId.current);
    } else {
      intervalId.current = setInterval(updateTime, 1000);
    }
  };

  const stopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    navigator.geolocation.clearWatch(watchId.current);
    clearInterval(intervalId.current);
    setReviewMode(true);
  };

  const updatePosition = (position) => {
    const { latitude, longitude } = position.coords;
    setRunData(prevData => {
      const newPath = [...prevData.path, [longitude, latitude]];
      const newDistance = calculateDistance(newPath);
      return {
        ...prevData,
        path: newPath,
        distance: newDistance,
        currentPace: calculatePace(newDistance, (Date.now() - startTime.current) / 1000),
        averagePace: calculatePace(newDistance, prevData.time)
      };
    });

    if (map.current) {
      map.current.setCenter([longitude, latitude]);
      // Update the map path here
    }
  };

  const updateTime = () => {
    setRunData(prevData => ({
      ...prevData,
      time: Math.floor((Date.now() - startTime.current) / 1000)
    }));
  };

  const handleLocationError = (error) => {
    console.error('Error getting location:', error);
  };

  const calculateDistance = (path) => {
    // Implement distance calculation logic here
    return 0; // Placeholder
  };

  const calculatePace = (distance, time) => {
    // Implement pace calculation logic here
    return 0; // Placeholder
  };

  const saveRun = () => {
    // Implement save logic here
    setReviewMode(false);
  };

  const deleteRun = () => {
    setRunData({
      time: 0,
      distance: 0,
      currentPace: 0,
      averagePace: 0,
      path: [],
    });
    setReviewMode(false);
  };

  const renderCloseButton = () => (
    <button
      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors duration-200"
      onClick={onClose}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );


  const renderInitialView = () => (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      {renderCloseButton()}
      <div ref={mapContainer} className="w-full h-96 mb-5 rounded-lg overflow-hidden" />
      {locationPermission === 'prompt' && (
        <button 
          className="w-full py-4 text-xl font-bold bg-blue-500 text-white rounded-md hover:opacity-90 mb-3"
          onClick={requestLocationPermission}
        >
          Enable Location Services
        </button>
      )}
      <button 
        className={`w-full py-4 text-xl font-bold ${locationPermission === 'granted' ? 'bg-green-500' : 'bg-gray-400'} text-white rounded-md hover:opacity-90 mb-3`}
        onClick={startRun}
        disabled={locationPermission !== 'granted'}
      >
        Start
      </button>
      <div className="flex justify-between w-full">
        <button 
          className="w-[48%] py-2 text-lg bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
          onClick={() => setView('stats')}
        >
          Stats
        </button>
        <button 
          className="w-[48%] py-2 text-lg bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
          onClick={() => setView('activities')}
        >
          Activities
        </button>
      </div>
    </div>
  );

  const renderRunningView = () => (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      {renderCloseButton()}
      <div ref={mapContainer} className="w-full h-96 mb-5 rounded-lg overflow-hidden" />
      <p className="mb-2">Time: {runData.time} seconds</p>
      <p className="mb-2">Distance: {runData.distance.toFixed(2)} km</p>
      <p className="mb-2">Current Pace: {runData.currentPace.toFixed(2)} min/km</p>
      <p className="mb-2">Average Pace: {runData.averagePace.toFixed(2)} min/km</p>
      <button 
        className="w-full py-3 text-lg bg-blue-500 text-white rounded-md hover:opacity-90 mb-3"
        onClick={pauseRun}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button 
        className="w-full py-3 text-lg bg-red-500 text-white rounded-md hover:opacity-90"
        onClick={stopRun}
      >
        Stop Run
      </button>
    </div>
  );

  const renderReviewMode = () => (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      {renderCloseButton()}
      <h2 className="text-2xl font-bold mb-5">Run Review</h2>
      <div ref={mapContainer} className="w-full h-96 mb-5 rounded-lg overflow-hidden" />
      <p className="mb-2">Time: {runData.time} seconds</p>
      <p className="mb-2">Distance: {runData.distance.toFixed(2)} km</p>
      <p className="mb-2">Average Pace: {runData.averagePace.toFixed(2)} min/km</p>
      <button 
        className="w-full py-3 text-lg bg-green-500 text-white rounded-md hover:opacity-90 mb-3"
        onClick={saveRun}
      >
        Save Run
      </button>
      <button 
        className="w-full py-3 text-lg bg-red-500 text-white rounded-md hover:opacity-90"
        onClick={deleteRun}
      >
        Delete Run
      </button>
    </div>
  );

  const renderStatsView = () => (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      {renderCloseButton()}
      <h2 className="text-2xl font-bold mb-5">Stats</h2>
      {/* Add stats content here */}
      <button 
        className="w-full py-3 text-lg bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
        onClick={() => setView('initial')}
      >
        Back
      </button>
    </div>
  );

  const renderActivitiesView = () => (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      {renderCloseButton()}
      <h2 className="text-2xl font-bold mb-5">Activities</h2>
      {/* Add activities content here */}
      <button 
        className="w-full py-3 text-lg bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
        onClick={() => setView('initial')}
      >
        Back
      </button>
    </div>
  );

  switch (view) {
    case 'running':
      return renderRunningView();
    case 'review':
      return renderReviewMode();
    case 'stats':
      return renderStatsView();
    case 'activities':
      return renderActivitiesView();
    default:
      return renderInitialView();
  }
};

export default MovementCompanion;