// dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import GoalsPage from './GoalsPage';
import ProgressPage from './ProgressPage';
import ToolsPage from './ToolsPage';
import { Theme } from '../theme.js';
import { useDimension } from '../DimensionContext';

const Dashboard = ({ canvasManager, onClose, onNodeChange }) => {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [activeTool, setActiveTool] = useState(null);
  const { currentDimension, setCurrentDimension, dimensionColors } = useDimension();
  const theme = new Theme();
  const [currentNode, setCurrentNode] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const lShapeRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (sidebarRef.current) setSidebarWidth(sidebarRef.current.offsetWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set dimensions

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
      : direction === 'prev'
        ? (currentIndex - 1 + canvasManager.defaultNodes.length) % canvasManager.defaultNodes.length
        : currentIndex;
    const newNode = canvasManager.defaultNodes[newIndex];
    
    setCurrentNode(newNode);
    setCurrentDimension(newNode.name);
    theme.updateThemeForNode(newNode);
    canvasManager.instantChangeCentralNode(canvasManager.orbits[0], canvasManager.orbits[0].centralNode, newNode);
    onNodeChange(newNode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToolOpen = (tool) => {
    setActiveTool(tool);
  };

  const handleToolClose = () => {
    setActiveTool(null);
    setCurrentPage('Tools');
    if(!currentDimension){
      setCurrentDimension(useDimension());
    }  
    theme.updateThemeForNode({ dimensionName: currentDimension });
  };

  const renderPage = () => {
    if (activeTool) {
      return React.cloneElement(activeTool, { onClose: handleToolClose });
    }

    switch (currentPage) {
      case 'Goals':
        return <GoalsPage />;
      case 'Progress':
        return <ProgressPage />;
      case 'Tools':
        return <ToolsPage onToolOpen={handleToolOpen} />;
      default:
        return <DashboardMain />;
    }
  };

  const Dimensionselector = (spectrumBlackText = false) => {
    const { dimensionMap } = useDimension();
  
    const getDimensionDisplay = (nodeName) => {
      if (nodeName === 'Spectrum') {
        return 'All\nDimensions';
      }
      const dimensionName = dimensionMap[nodeName];
      return `${dimensionName}\nDimension`;
    };
  
    // const isSpectrumBlackText = spectrumBlackText && currentNode && currentNode.name === 'Spectrum';
    const isSpectrumBlackText = false;
  
    return (
      <div className={`flex items-center justify-between ${isMobile ? 'px-0' : 'px-2'} py-3`}>
        <button
          className={`${isSpectrumBlackText ? 'spectrum-black-text' : ''} rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent ${
            isMobile ? 'py-2 pr-2' : 'p-2'
          }`}
          onClick={() => handleNodeChange('prev')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'} fill-current`} viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <span 
          className={`${isSpectrumBlackText ? 'spectrum-black-text' : ''} font-semibold dimension-theme-colored ${isMobile ? 'text-lg' : 'text-sm'} flex-grow text-center px-2`} 
          style={{ 
            background: 'none', 
            minWidth: '170px',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '48px'
          }}
        >
          {currentNode ? getDimensionDisplay(currentNode.name) : ''}
        </span>
        <button
          className={`${isSpectrumBlackText ? 'spectrum-black-text' : ''} p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent`}
          onClick={() => handleNodeChange('next')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'} fill-current`} viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    );
  }

  const updateLShapeBG = () => {
    console.log("test1");
    if (lShapeRef.current) {
        const currentColor = dimensionColors[currentDimension];
        lShapeRef.current.style.borderTopWidth = `${headerHeight}px`;
        lShapeRef.current.style.borderLeftWidth = isSidebarOpen ? `${sidebarWidth}` : '0px';

        if (isSidebarOpen && isMobile) {
            lShapeRef.current.style.borderLeftWidth = `290px`;
        }

        if (currentDimension === 'Spectrum') {
            console.log("test2");
            lShapeRef.current.style.borderImage = `${currentColor} 1`;
            lShapeRef.current.style.borderColor = 'transparent';
            lShapeRef.current.style.animation = 'gradientShift 3s linear infinite alternate';
        } else {
            lShapeRef.current.style.borderImage = 'none';
            lShapeRef.current.style.borderColor = `${currentColor}`;
            lShapeRef.current.style.animation = 'none';
        }
    }
}

  useEffect(() => {
    updateLShapeBG();
  }, [headerHeight, sidebarWidth, isSidebarOpen, currentDimension, dimensionColors]);

  useEffect(() => {
    // Add keyframe animation to the document
    const style = document.createElement('style');
    if(!isMobile){
      style.textContent = `
      @keyframes gradientShift {
        0% {
          border-image-source: linear-gradient(30deg, #FFA500 0%, #FF4500 16.67%, #8A2BE2 33.33%, #4169E1 50%, #2E8B57 66.67%, #ffd900 83.33%, #FFA500 100%);
        }
        100% {
          border-image-source: linear-gradient(30deg, #ffd900 0%, #FFA500 16.67%, #FF4500 33.33%, #8A2BE2 50%, #4169E1 66.67%, #2E8B57 83.33%, #ffd900 100%);
        }
      }
    `;
    } else{
      style.textContent = `
      @keyframes gradientShift {
        0% {
          border-image-source: linear-gradient(75deg, #FFA500 0%, #FF4500 16.67%, #8A2BE2 33.33%, #4169E1 50%, #2E8B57 66.67%, #ffd900 83.33%, #FFA500 100%);
        }
        100% {
          border-image-source: linear-gradient(75deg, #ffd900 0%, #FFA500 16.67%, #FF4500 33.33%, #8A2BE2 50%, #4169E1 66.67%, #2E8B57 83.33%, #ffd900 100%);
        }
      }
    `;
    }

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div id="dashboard-popup" style={{ display: 'block' }}>
      <div id="dashboard-content" className='overflow-y-scroll'>
        {!activeTool && (
          <div id="dashboard-header" ref={headerRef} className="flex items-center justify-between dimension-theme-colored-no-bg bg-transparent sticky top-0 z-40 py-0 px-4 shadow-md overflow-x-auto">
            <button
              className="flex-shrink-0 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
              onClick={toggleSidebar}
            >
              <img src="/Images/UI/menu.svg" alt="Toggle Sidebar" className="w-6 h-6" />
            </button>
            
            <h1 className={`${currentDimension === 'Spectrum' ? 'spectrum-black-text' : ''} text-xl font-bold text-center mx-2`}>{currentPage}</h1>
            
            {!isMobile && <Dimensionselector spectrumBlackText={true} />}
            
            <button
              id="close-dashboard-button"
              className="flex-shrink-0 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-transparent"
              onClick={onClose}
            >
              <img src="/Images/UI/close.svg" alt="close" className="w-6 h-6" />
            </button>
          </div>
        )}
        {!activeTool && isSidebarOpen && (
          <div 
            id="dashboard-sidebar" 
            ref={sidebarRef}
            className="fixed z-40 h-full overflow-y-auto"
            style={{
              width: isMobile ? '300px' : '200px',
              transition: 'width 0.3s ease-in-out'
            }}
          >
            <nav className="dimension-theme-colored-no-bg bg-transparent" id="sidebar-nav">
              <ul>
                {isMobile && (<li><Dimensionselector spectrumBlackText={true} /></li>)}
                <li>
                  <a
                    href="#"
                    className={`dimension-theme-colored ${currentDimension === 'Spectrum' ? 'spectrum-black-text' : ''} block p-4 ${currentPage === 'Dashboard' ? 'underline font-bold' : ''}`}
                    onClick={() => { setCurrentPage('Dashboard'); isMobile && toggleSidebar(); }}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`dimension-theme-colored ${currentDimension === 'Spectrum' ? 'spectrum-black-text' : ''} block p-4 ${currentPage === 'Goals' ? 'underline font-bold' : ''}`}
                    onClick={() => { setCurrentPage('Goals'); isMobile && toggleSidebar(); }}
                  >
                    Goals
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`dimension-theme-colored ${currentDimension === 'Spectrum' ? 'spectrum-black-text' : ''} block p-4 ${currentPage === 'Progress' ? 'underline font-bold' : ''}`}
                    onClick={() => { setCurrentPage('Progress'); isMobile && toggleSidebar(); }}
                  >
                    Progress
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`dimension-theme-colored ${currentDimension === 'Spectrum' ? 'spectrum-black-text' : ''} block p-4 ${currentPage === 'Tools' ? 'underline font-bold' : ''}`}
                    onClick={() => { setCurrentPage('Tools'); isMobile && toggleSidebar(); }}
                  >
                    Tools
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
        {!activeTool && isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20" 
            style={{ margin: "0" }}
            onClick={toggleSidebar}
          ></div>
        )}
        {!activeTool && (
          <div
            id="dashboard-header-sidebar-bg"
            ref={lShapeRef}
            className="fixed bg-transparent transition-all duration-500 dimension-theme-colored-LShape pointer-events-none z-30" 
            style={{
              borderStyle: 'solid',
              borderTopWidth: `${headerHeight}px`,
              borderLeftWidth: isSidebarOpen ? `${sidebarWidth}px` : '0px',
              width: '100vw',
              height: '100vh',
              top: '0',
              left: '0',
              boxSizing: 'border-box',
            }}
          ></div>
        )}
        <main className='bg-white text-black' style={{ 
          marginLeft: !activeTool && isSidebarOpen && !isMobile ? '220px' : '0', 
          transition: 'margin-left 0.3s'
        }}>
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
