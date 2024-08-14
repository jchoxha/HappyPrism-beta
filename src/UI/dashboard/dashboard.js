// dashboard.js
import React, { useState, useEffect } from 'react';
import GoalsPage from './GoalsPage';
import ProgressPage from './ProgressPage';
import ToolsPage from './ToolsPage';
import { Theme } from '../theme.js';
import { useDimension } from '../DimensionContext';

const Dashboard = ({ canvasManager, onClose, onNodeChange }) => {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const { currentDimension, setCurrentDimension, dimensionColors } = useDimension();
  const theme = new Theme();
  const [currentNode, setCurrentNode] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (canvasManager && !canvasManager.defaultNodesInitialized) {
      canvasManager.initNodesOnDashboardOpen(canvasManager);
    }
  }, [canvasManager]);

  useEffect(() => {
    const colors = theme.getColorsForNode({ dimensionName: currentDimension });
    theme.updateThemeForNode({ dimensionName: currentDimension });
    console.log("Current dimension: ", currentDimension);
  }, [currentDimension]);

  useEffect(() => {
    if (canvasManager.defaultNodes.length > 0) {
      const node = canvasManager.defaultNodes.find(node => node.name === currentDimension) || canvasManager.defaultNodes[0];
      setCurrentNode(node);
    }
  }, [canvasManager.defaultNodes, currentDimension]);

  const handleNodeChange = (direction) => {
    const currentIndex = canvasManager.defaultNodes.findIndex(node => node.name === currentNode.name);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % canvasManager.defaultNodes.length
      : (currentIndex - 1 + canvasManager.defaultNodes.length) % canvasManager.defaultNodes.length;
    const newNode = canvasManager.defaultNodes[newIndex];
    
    setCurrentNode(newNode);
    setCurrentDimension(newNode.name);
    theme.updateThemeForNode(newNode);
    canvasManager.instantChangeCentralNode(canvasManager.orbits[0], canvasManager.orbits[0].centralNode, newNode);
    onNodeChange(newNode);
  };

  const toggleSidebar = () => {
    console.log('toggleSidebar');
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Goals':
        return <GoalsPage />;
      case 'Progress':
        return <ProgressPage />;
      case 'Tools':
        return <ToolsPage />;
      default:
        return <DashboardMain />;
    }
  };

  const Dimensionselector = () => {
    const { dimensionMap } = useDimension();
  
    const getDimensionDisplay = (nodeName) => {
      if (nodeName === 'Spectrum') {
        return 'All\nDimensions';
      }
      const dimensionName = dimensionMap[nodeName];
      return `${dimensionName}\nDimension`;
    };
  
    return (
      <div className={`flex items-center justify-between ${isMobile ? 'px-0' : 'px-2'} py-3`}>
        <button
          className={`rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent ${
            isMobile ? 'py-2 pr-2' : 'p-2'
          }`}
          onClick={() => handleNodeChange('prev')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'} fill-current text-white`} viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <span 
          className={`font-semibold dimension-theme-colored ${isMobile ? 'text-lg' : 'text-sm'} flex-grow text-center px-2`} 
          style={{ 
            background: 'none', 
            minWidth: '170px',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '48px'  // Adjust this value as needed
          }}
        >
          {currentNode ? getDimensionDisplay(currentNode.name) : ''}
        </span>
        <button
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
          onClick={() => handleNodeChange('next')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'} fill-current text-white`} viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    );
  }


  return (
    <div id="dashboard-popup" style={{ display: 'block' }}>
      <div id="dashboard-content">
      <div id="dashboard-header" className="flex items-center justify-between dimension-theme-colored sticky top-0 z-40 py-0 px-4 shadow-md overflow-x-auto">

        <button
          className="flex-shrink-0 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
          onClick={toggleSidebar}
        >
          <img src="/Images/UI/menu.svg" alt="Toggle Sidebar" className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-bold text-center mx-2">{currentPage}</h1>
        
        {!isMobile && <Dimensionselector />}
        
        <button
          id="close-dashboard-button"
          className="flex-shrink-0 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
          onClick={onClose}
        >
          <img src="/Images/UI/close.svg" alt="close" className="w-6 h-6" />
        </button>
      </div>
        {isSidebarOpen && (
            <div 
              id="dashboard-sidebar" 
              className="fixed z-30 h-full overflow-y-auto"
              style={{
                width: isMobile ? '300px' : '200px',
                transition: 'width 0.3s ease-in-out'
              }}
            >
            <nav className="dimension-theme-colored" id="sidebar-nav">
            <ul>
              {isMobile && (<li><Dimensionselector /></li>)}
              <li>
                <a
                  href="#"
                  className={`dimension-theme-colored block p-4 ${currentPage === 'Dashboard' ? 'underline font-bold' : ''}`}
                  onClick={() => { setCurrentPage('Dashboard'); isMobile && toggleSidebar(); }}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`dimension-theme-colored block p-4 ${currentPage === 'Goals' ? 'underline font-bold' : ''}`}
                  onClick={() => { setCurrentPage('Goals'); isMobile && toggleSidebar(); }}
                >
                  Goals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`dimension-theme-colored block p-4 ${currentPage === 'Progress' ? 'underline font-bold' : ''}`}
                  onClick={() => { setCurrentPage('Progress'); isMobile && toggleSidebar(); }}
                >
                  Progress
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`dimension-theme-colored block p-4 ${currentPage === 'Tools' ? 'underline font-bold' : ''}`}
                  onClick={() => { setCurrentPage('Tools'); isMobile && toggleSidebar(); }}
                >
                  Tools
                </a>
              </li>
            </ul>
            </nav>
          </div>
        )}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20" 
            style={{ margin: "0" }}
            onClick={toggleSidebar}
          ></div>
        )}
        <main style={{ marginLeft: isSidebarOpen && !isMobile ? '220px' : '0', transition: 'margin-left 0.3s' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};


const DashboardMain = () => (
  <section id="dashboard-main" className="dashboard-page">
    <h2>Dashboard</h2>
    <div id="main-calendar">
      <h3>Weekly Calendar</h3>
      <div className="mc-week">
        <div className="mc-day">Mon</div>
        <div className="mc-day">Tue</div>
        <div className="mc-day">Wed</div>
        <div className="mc-day">Thu</div>
        <div className="mc-day">Fri</div>
        <div className="mc-day">Sat</div>
        <div className="mc-day">Sun</div>
      </div>
    </div>
    <div className="daily-insights">
      <h3>Daily Insights</h3>
      <div className="insight">
        <p>Insight 1: Your current productivity is high! Keep up the great work!</p>
      </div>
      <div className="navigation">
        <button className="prev-insight dimension-theme-colored">Previous</button>
        <button className="next-insight dimension-theme-colored">Next</button>
      </div>
    </div>
    <div className="quick-update">
      <h3>Quick Update</h3>
      <form>
        <div className="goal-update">
          <label htmlFor="goal1">Exercise</label>
          <input type="number" id="goal1" name="goal1" placeholder="Minutes" />
          <button type="button" className="dimension-theme-colored">Update</button>
        </div>
        <div className="goal-update">
          <label htmlFor="goal2">Reading</label>
          <input type="number" id="goal2" name="goal2" placeholder="Pages" />
          <button type="button" className="dimension-theme-colored">Update</button>
        </div>
        <div className="goal-update">
          <label htmlFor="goal3">Meditation</label>
          <input type="number" id="goal3" name="goal3" placeholder="Minutes" />
          <button type="button" className="dimension-theme-colored">Update</button>
        </div>
      </form>
    </div>
    <div className="recently-updated">
      <h3>Recently Updated</h3>
      <ul>
        <li>Exercise - 30 minutes</li>
        <li>Reading - 20 pages</li>
        <li>Meditation - 15 minutes</li>
      </ul>
    </div>
    <div className="completed-goals">
      <h3>Completed Goals</h3>
      <ul>
        <li><span className="emoji">🏆</span> Challenge - Completed 5K Run</li>
        <li><span className="emoji">🥇</span> Challenge - Read 10 Books in 3 months</li>
        <li><span className="emoji">🏆</span> Habit - Meditate 15 minutes Daily for 30 days</li>
        <li><span className="emoji">🥇</span> Project - Complete version 1.0 of Goal Setting App</li>
      </ul>
    </div>
  </section>
);

export default Dashboard;
