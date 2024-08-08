// dashboard.js
import React, { useState, useEffect } from 'react';
import GoalsPage from './GoalsPage';
import ProgressPage from './ProgressPage';
import ToolsPage from './ToolsPage';
import { Theme } from '../theme.js';
import { useDimension } from '../DimensionContext';

const Dashboard = ({ canvasManager, onClose }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentDimension, setCurrentDimension, dimensionColors } = useDimension();
  const theme = new Theme();
  const [currentNode, setCurrentNode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
  };

  const toggleSidebar = () => {
    console.log('toggleSidebar');
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'goals':
        return <GoalsPage />;
      case 'progress':
        return <ProgressPage />;
      case 'tools':
        return <ToolsPage />;
      default:
        return <DashboardMain />;
    }
  };

  return (
    <div id="dashboard-popup" style={{ display: 'block' }}>
      <button
        id="close-dashboard-button"
        className="activatable-button dimension-theme-colored"
        onClick={onClose}
      >
        <img src="/Images/UI/close.svg" alt="close" />
      </button>
      <div id="dashboard-content">
      <div id="dashboard-header" className="dimension-theme-colored sticky top-0 z-30 p-4 shadow-md">
          <button
            className="mr-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
            onClick={toggleSidebar}
          >
            <img src="/Images/UI/menu.svg" alt="Toggle Sidebar" className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center">
            <button
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
              onClick={() => handleNodeChange('prev')}
            >
              <img src="/Images/UI/left.svg" alt="Previous Node" className="w-6 h-6" />
            </button>
            <span className="mx-4 text-lg font-semibold">
              {currentNode ? currentNode.name : ''}
            </span>
            <button
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
              onClick={() => handleNodeChange('next')}
            >
              <img src="/Images/UI/right.svg" alt="Next Node" className="w-6 h-6" />
            </button>
          </div>
        </div>
        {isSidebarOpen && (
          <div id="dashboard-sidebar" className="fixed z-30">
            <nav className="dimension-theme-colored" id="sidebar-nav">
            <ul>
                <li><a href="#" className="dimension-theme-colored block p-4" onClick={() => { setCurrentPage('dashboard'); isMobile && toggleSidebar(); }}>Dashboard</a></li>
                <li><a href="#" className="dimension-theme-colored block p-4" onClick={() => { setCurrentPage('goals'); isMobile && toggleSidebar(); }}>Goals</a></li>
                <li><a href="#" className="dimension-theme-colored block p-4" onClick={() => { setCurrentPage('progress'); isMobile && toggleSidebar(); }}>Progress</a></li>
                <li><a href="#" className="dimension-theme-colored block p-4" onClick={() => { setCurrentPage('tools'); isMobile && toggleSidebar(); }}>Tools</a></li>
              </ul>
            </nav>
          </div>
        )}
        {isSidebarOpen && isMobile && (
          <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
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
