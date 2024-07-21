// dashboard.js
import React, { useState, useEffect } from 'react';
import GoalsPage from './GoalsPage';
import ProgressPage from './ProgressPage';
import ToolsPage from './ToolsPage';
import { Theme } from '../theme.js';
import { useDimension } from '../DimensionContext';

const Dashboard = ({ canvasManager, onClose }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentDimension, dimensionColors } = useDimension();
  const theme = new Theme();

  useEffect(() => {
    const colors = theme.getColorsForNode({ dimensionName: currentDimension });
    theme.updateThemeForNode({ dimensionName: currentDimension });
  }, [currentDimension]);

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
        <div id="dashboard-sidebar">
          <nav className="dimension-theme-colored" id="sidebar-nav">
            <ul>
              <li><a href="#" className="dimension-theme-colored" onClick={() => setCurrentPage('dashboard')}>Dashboard</a></li>
              <li><a href="#" className="dimension-theme-colored" onClick={() => setCurrentPage('goals')}>Goals</a></li>
              <li><a href="#" className="dimension-theme-colored" onClick={() => setCurrentPage('progress')}>Progress</a></li>
              <li><a href="#" className="dimension-theme-colored" onClick={() => setCurrentPage('tools')}>Tools</a></li>
            </ul>
          </nav>
        </div>
        <main>
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
