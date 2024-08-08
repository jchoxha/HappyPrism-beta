import React, { createContext, useContext, useState } from 'react';

const DimensionContext = createContext();

export const useDimension = () => useContext(DimensionContext);

export const DimensionProvider = ({ children }) => {
  const [currentDimension, setCurrentDimension] = useState('Spectrum');

  const agents = [
    'Spectrum',
    'Sol',
    'Amber',
    'Red',
    'Violet',
    'Jean',
    'Ivy'
  ];

  const dimensionMap = {
    'Spectrum': 'Spectrum',
    'Sol': 'Spiritual',
    'Amber': 'Mental',
    'Red': 'Physical',
    'Violet': 'Social',
    'Jean': 'Vocational',
    'Ivy': 'Environmental'
  };

  const dimensionColors = {
    'Spectrum': 'linear-gradient(-45deg, #ffd900 0%, #FFA500 16.67%, #FF4500 33.33%, #8A2BE2 50%, #4169E1 66.67%, #2E8B57 83.33%, #ffd900 100%)',
    'Sol': '#ffd900',    // Yellow
    'Amber': '#FFA500',  // Orange
    'Red': '#FF4500',    // Red
    'Violet': '#8A2BE2', // Purple
    'Jean': '#4169E1',   // Blue
    'Ivy': '#2E8B57'     // Green
  };

  const getDimensionsForNewGoal = () => {
    if (currentDimension === 'Spectrum') {
      return {
        Spiritual: true,
        Mental: true,
        Physical: true,
        Social: true,
        Vocational: true,
        Environmental: true
      };
    } else {
      return {
        Spiritual: dimensionMap[currentDimension] === 'Spiritual',
        Mental: dimensionMap[currentDimension] === 'Mental',
        Physical: dimensionMap[currentDimension] === 'Physical',
        Social: dimensionMap[currentDimension] === 'Social',
        Vocational: dimensionMap[currentDimension] === 'Vocational',
        Environmental: dimensionMap[currentDimension] === 'Environmental'
      };
    }
  };

  const value = {
    currentDimension,
    setCurrentDimension,
    agents,
    dimensionMap,
    dimensionColors,
    getDimensionsForNewGoal
  };

  return (
    <DimensionContext.Provider value={value}>
      {children}
    </DimensionContext.Provider>
  );
};