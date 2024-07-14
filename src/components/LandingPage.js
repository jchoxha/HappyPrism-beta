import React, { useEffect, useState, useRef, useMemo  } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const LandingPage = () => {
  const dimensions = [
    { name: 'Spiritual', emoji: '✨', color: 'bg-yellow-300', description: 'Explore your inner self and connect with your beliefs and values.' },
    { name: 'Mental', emoji: '🧠', color: `orange-bg`, description: 'Enhance your cognitive abilities and emotional wellbeing.' },
    { name: 'Physical', emoji: '💪', color: 'bg-red-400', description: "Improve your body's health and fitness through exercise and nutrition." },
    { name: 'Social', emoji: '👥', color: 'bg-purple-400', description: 'Build and maintain meaningful relationships with others.' },
    { name: 'Vocational', emoji: '💼', color: 'bg-blue-400', description: 'Develop your career and find purpose in your work.' },
    { name: 'Environmental', emoji: '🌍', color: 'bg-green-400', description: 'Create harmony with your surroundings and the planet.' },
  ];

  const aiAgents = [
    { 
      name: 'Spectrum', 
      image: '/Images/Nodes/Spectrum/static.png',
      description: 'Spectrum is your primary guide and the overseer of your entire wellness journey. As an AI Agent designed to improve the wellbeing of all humans, Spectrum helps you navigate the app and understand the key concepts of HappyPrism.',
      dimension: null
    },
    { 
      name: 'Sol', 
      image: '/Images/Nodes/Sol/static.png',
      description: 'Sol is a wise, spiritual being deeply connected with all things. Well-versed in the teachings of all faiths, Sol guides users in their spiritual dimension, helping them follow their own truth and achieve inner peace.',
      dimension: 'Spiritual'
    },
    { 
      name: 'Amber', 
      image: '/Images/Nodes/Amber/static.png',
      description: 'Amber is a wise and insightful guide for the mental dimension. With a deep understanding of human emotions and intellect, Amber supports users in enhancing their mental and emotional wellbeing.',
      dimension: 'Mental'
    },
    { 
      name: 'Red', 
      image: '/Images/Nodes/Red/static.png',
      description: 'Red is dynamic and energetic, focusing on the physical dimension. Always ready to inspire and motivate, Red helps users reach their fitness goals and improve their overall physical health.',
      dimension: 'Physical'
    },
    { 
      name: 'Violet', 
      image: '/Images/Nodes/Violet/static.png',
      description: 'Violet is a warm and friendly figure specializing in the social dimension. With a charismatic and empathetic nature, Violet assists users in building and maintaining strong, healthy relationships.',
      dimension: 'Social'
    },
    { 
      name: 'Jean', 
      image: '/Images/Nodes/Jean/static.png',
      description: 'Jean is a dedicated and industrious guide for the vocational dimension. Committed to helping users discover their passions and develop skills, Jean supports professional growth and meaningful work pursuits.',
      dimension: 'Vocational'
    },
    { 
      name: 'Ivy', 
      image: '/Images/Nodes/Ivy/static.png',
      description: 'Ivy is nurturing and eco-conscious, focused on the environmental dimension. Deeply connected with nature, Ivy guides users in understanding and improving their interactions with various environmental contexts.',
      dimension: 'Environmental'
    },
  ];

  const [selectedAgent, setSelectedAgent] = useState(aiAgents[0]);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const descriptionRef = useRef(null);
  const [showHomeInNav, setShowHomeInNav] = useState(false);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [selectedStep, setSelectedStep] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedDimension, setSelectedDimension] = useState({
    name: "Every Dimension Matters",
    emoji: "🌈",
    description: "HappyPrism helps you balance your pursuits across all aspects of your life!"
  });

  const handleDimensionSelect = (dimension) => {
    setSelectedDimension(dimension);
    setSelectedAgent(aiAgents.find(a => a.dimension === dimension.name) || aiAgents[0]);
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    if (agent.name === "Spectrum") {
      setSelectedDimension({
        name: "Every Dimension Matters",
        emoji: "🌈",
        description: "HappyPrism helps you balance your pursuits across all aspects of your life!"
      });
    } else {
      setSelectedDimension(agent.dimension ? dimensions.find(d => d.name === agent.dimension) : null);
    }
  };
  const SmartAcronym = ({ words }) => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: false,
    });

    return (
      <div ref={ref} className="flex flex-col items-start justify-center h-full">
        {'SMART'.split('').map((letter, index) => (
          <div key={index} className="flex items-center mb-2">
            <span 
              className={`text-3xl font-bold transition-all duration-500 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} 
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {letter}
            </span>
            <span 
              className={`text-lg transition-all duration-500 ${
                inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`} 
              style={{ transitionDelay: `${(index * 100) + 50}ms` }}
            >
              {words[index]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const AIGuidanceAnimation = () => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: false,
    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
      if (inView) {
        if (isMobile) {
          anime({
            targets: '#robot, .dot, #flag',
            translateY: ['-100%', '0%'],
            opacity: [0, 1],
            easing: 'easeOutQuad',
            duration: 1000,
            delay: anime.stagger(300),
          });
        } else {
          // Desktop animation remains the same
          anime({
            targets: '.dot',
            opacity: [0, 1],
            translateY: ['-100%', '0%'],
            delay: anime.stagger(100, {start: 500}),
            easing: 'easeOutQuad',
          });

          anime({
            targets: '#robot, #flag',
            translateY: ['-100%', '0%'],
            opacity: [0, 1],
            easing: 'easeOutQuad',
            duration: 1000,
            delay: (el, i) => i * 1000,
          });
        }
      } else {
        anime({
          targets: '.dot, #robot, #flag',
          opacity: 0,
          translateY: '-100%',
          easing: 'easeInQuad',
          duration: 500,
        });
      }
    }, [inView, isMobile]);

    const numDots = isMobile ? 3 : 7;
    const amplitude = isMobile ? 0 : 20;
    const frequency = 1;

    return (
      <div ref={ref} className="relative h-52 w-full">
        <span 
          id="robot" 
          className={`absolute text-4xl ${isMobile ? 'top-0' : 'left-0 top-1/2 -translate-y-1/2'} opacity-0`}
          style={{
            left: isMobile ? '35%' : ``,
          }}
        >🤖</span>
        {[...Array(numDots)].map((_, i) => (
          <span 
            key={i} 
            className="dot absolute text-2xl opacity-0"
            style={{
              left: isMobile ? '50%' : `${(i + 1) * (100 / (numDots + 1))}%`,
              top: isMobile ? `${(i + 1) * 20}%` : `${50 + amplitude * Math.sin((i / numDots) * Math.PI * 2 * frequency)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            •
          </span>
        ))}
        <span 
          id="flag" 
          className={`absolute text-4xl ${isMobile ? 'bottom-0' : 'right-0 top-1/2 -translate-y-1/2'} opacity-0`} 
          style={{
            left: isMobile ? '40%' : ``,
          }}
          >🚩</span>
      </div>
    );
  };


  const ComprehensiveDashboardAnimation = () => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: false,
    });
  
    const [isMobile, setIsMobile] = useState(false);
    const [activeChart, setActiveChart] = useState(0);
  
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  
    useEffect(() => {
      if (isMobile) {
        setActiveChart((prev) => (prev + 1) % 3);
        const interval = setInterval(() => {
          setActiveChart((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
      }
    }, [isMobile]);
  
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false, // Disable tooltips
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuad',
      },
    };
  
    const [lineConfig, setLineConfig] = useState({
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        }],
      },
      options: commonOptions,
    });
  
    const [barConfig, setBarConfig] = useState({
      data: {
        labels: ['Mental', 'Physical', 'Social', 'Spiritual', 'Vocational', 'Environmental'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        }],
      },
      options: commonOptions,
    });
  
    const [pieConfig, setPieConfig] = useState({
      data: {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
          data: [0, 0, 100],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
        }],
      },
      options: commonOptions,
    });
  
    useEffect(() => {
      if (inView) {
        setLineConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [30, 60, 40, 70, 50, 80],
            }],
          },
        }));
  
        setBarConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [70, 80, 60, 75, 85, 65],
            }],
          },
        }));
  
        setPieConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [60, 30, 10],
            }],
          },
        }));
      } else {
        setLineConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [0, 0, 0, 0, 0, 0],
            }],
          },
        }));
  
        setBarConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [0, 0, 0, 0, 0, 0],
            }],
          },
        }));
  
        setPieConfig(prevConfig => ({
          ...prevConfig,
          data: {
            ...prevConfig.data,
            datasets: [{
              ...prevConfig.data.datasets[0],
              data: [0, 0, 100],
            }],
          },
        }));
      }
    }, [inView]);
  
    const renderChart = (index) => {
      switch(index) {
        case 0:
          return <Line data={lineConfig.data} options={lineConfig.options} />;
        case 1:
          return <Bar data={barConfig.data} options={barConfig.options} />;
        case 2:
          return <Pie data={pieConfig.data} options={pieConfig.options} />;
        default:
          return null;
      }
    };
  
    return (
      <div ref={ref} className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 h-64`}>
        {isMobile ? (
          <div className="chart-container bg-white rounded-lg shadow p-2">
            {renderChart(activeChart)}
          </div>
        ) : (
          <>
            <div className="chart-container bg-white rounded-lg shadow p-2">
              <Line data={lineConfig.data} options={lineConfig.options} />
            </div>
            <div className="chart-container bg-white rounded-lg shadow p-2">
              <Bar data={barConfig.data} options={barConfig.options} />
            </div>
            <div className="chart-container bg-white rounded-lg shadow p-2">
              <Pie data={pieConfig.data} options={pieConfig.options} />
            </div>
          </>
        )}
      </div>
    );
  };

  const WellnessToolCard = ({ name, emoji, color, reverse }) => (
    <div className={`flex flex-col items-center justify-center w-32 h-40 ${color} rounded-lg shadow-md p-2 mx-2`}>
      {reverse ? (
        <>
          <span className="text-4xl mb-2">{emoji}</span>
          <span className="text-sm font-semibold text-center">{name}</span>
        </>
      ) : (
        <>
          <span className="text-sm font-semibold text-center mb-2">{name}</span>
          <span className="text-4xl">{emoji}</span>
        </>
      )}
    </div>
  );
  
  const WellnessToolsCarousel = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const carouselRef = useRef(null);
  
    const wellnessTools = [
      { name: "Meditation Timer", emoji: "⏲️", color: "bg-yellow-200", dimension: "Spiritual" },
      { name: "Mood Tracker", emoji: "📊", color: "bg-orange-200", dimension: "Mental" },
      { name: "Workout Planner", emoji: "🏋️", color: "bg-red-200", dimension: "Physical" },
      { name: "Social Calendar", emoji: "🗓️", color: "bg-purple-200", dimension: "Social" },
      { name: "Career Roadmap", emoji: "🗺️", color: "bg-blue-200", dimension: "Vocational" },
      { name: "Eco-Challenge", emoji: "🌱", color: "bg-green-200", dimension: "Environmental" },
      { name: "Gratitude Journal", emoji: "📓", color: "bg-yellow-200", dimension: "Spiritual" },
      { name: "Stress Relief", emoji: "😌", color: "bg-orange-200", dimension: "Mental" },
      { name: "Nutrition Log", emoji: "🥗", color: "bg-red-200", dimension: "Physical" },
      { name: "Friend Finder", emoji: "👥", color: "bg-purple-200", dimension: "Social" },
      { name: "Skill Builder", emoji: "🛠️", color: "bg-blue-200", dimension: "Vocational" },
      { name: "Nature Connect", emoji: "🏞️", color: "bg-green-200", dimension: "Environmental" },
    ];
  
    useEffect(() => {
      const animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, []);
  
    const animate = () => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition + 1;
        if (newPosition >= carouselRef.current.scrollWidth / 2) {
          return 0;
        }
        return newPosition;
      });
      requestAnimationFrame(animate);
    };
  
    return (
      <div className="w-full overflow-hidden">
        <div
          ref={carouselRef}
          className="flex"
          style={{
            transform: `translateX(-${scrollPosition}px)`,
            width: `${wellnessTools.length * 160}px`, // 160px is the width of each card (128px) plus margins (32px)
          }}
        >
          {wellnessTools.concat(wellnessTools).map((tool, index) => (
            <WellnessToolCard
              key={`${tool.name}-${index}`}
              name={tool.name}
              emoji={tool.emoji}
              color={tool.color}
              reverse={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    );
  };

  const HappyPrismProcessAnimation = ({ onStepClick }) => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: false,
    });
  
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const stepsWithEmojis = [
      { step: "Learn", emoji: "📚", sentence: "Learn about the dimensions of wellness and how they apply to your life." },
      { step: "Focus", emoji: "🎯", sentence: "Focus on one dimension at a time to make meaningful, concentrated progress." },
      { step: "Visualize", emoji: "👁️", sentence: "Visualize your ideal state within each dimension to create a clear vision of your future self." },
      { step: "Set", emoji: "🏆", sentence: "Set SMART goals that are Specific, Measurable, Achievable, Relevant, and Time-bound." },
      { step: "Plan", emoji: "🗺️", sentence: "Plan your journey by breaking down your goals into actionable steps." },
      { step: "Schedule", emoji: "📅", sentence: "Schedule regular check-ins and activities to maintain progress and accountability." },
      { step: "Track", emoji: "📊", sentence: "Track your progress using HappyPrism's intuitive tools and AI-powered insights." },
      { step: "Implement", emoji: "🚀", sentence: "Implement your plan with the support of our dimension-specific AI agents." },
      { step: "Review", emoji: "🔍", sentence: "Review and adjust your objectives regularly to ensure continued growth and success." }
    ];
  
    return (
      <div ref={ref} className="flex flex-col items-stretch justify-center h-full overflow-hidden">
        {stepsWithEmojis.map(({ step, emoji, sentence }, index) => (
          <div 
            key={index} 
            className="flex items-center mb-4 cursor-pointer"
            style={{ 
              opacity: inView ? 1 : 0,
              animation: inView ? `wave 2s ease-in-out infinite ${index * 0.1}s` : 'none',
              transform: 'translateX(0)',
            }}
            onClick={() => onStepClick({ step, emoji, sentence })}
          >
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-md">
              <span className="text-2xl font-bold mr-2">
                {index + 1}
              </span>
              <span className="text-2xl font-bold mr-2">
                -
              </span>
              <span className="text-lg mr-2">
                {step}
              </span>
              <span className="text-2xl">
                {emoji}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const MemoizedSmartAcronym = useMemo(() => React.memo(SmartAcronym), []);
  const MemoizedAIGuidanceAnimation = useMemo(() => React.memo(AIGuidanceAnimation), []);
  const MemoizedComprehensiveDashboardAnimation = useMemo(() => React.memo(ComprehensiveDashboardAnimation), []);
  const MemoizedWellnessToolsCarousel = useMemo(() => React.memo(WellnessToolsCarousel), []);
  const MemoizedHappyPrismProcessAnimation = useMemo(() => React.memo(HappyPrismProcessAnimation), []);

  const features = useMemo(() => [
    { 
      title: 'Personalized Goal Setting', 
      description: 'Set and track your wellness goals using S.M.A.R.T. criteria for maximum effectiveness.',
      smartWords: ['pecific', 'easurable', 'chievable', 'elevant', 'ime-bound'],
      animation: MemoizedSmartAcronym
    },
    { 
      title: 'AI-Powered Guidance', 
      description: 'Interact with dimension-specific AI agents for personalized support and advice.',
      animation: MemoizedAIGuidanceAnimation
    },
    { 
      title: 'Comprehensive Dashboard', 
      description: 'Monitor your progress across all wellness dimensions in one intuitive interface.',
      animation: MemoizedComprehensiveDashboardAnimation
    },
    { 
      title: 'Customized Wellness Tools', 
      description: 'Access specialized tools designed for each dimension of your wellness journey.',
      animation: MemoizedWellnessToolsCarousel
    },
    { 
      title: 'The HappyPrism Process', 
      description: 'Follow our step-by-step guide to achieve holistic wellness and personal growth.', 
      animation: MemoizedHappyPrismProcessAnimation
    },
  ], [MemoizedSmartAcronym, MemoizedAIGuidanceAnimation, MemoizedComprehensiveDashboardAnimation, MemoizedWellnessToolsCarousel, MemoizedHappyPrismProcessAnimation]);

  const [expandedFeature, setExpandedFeature] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerTop = headerRef.current.getBoundingClientRect().top;
        setShowHomeInNav(headerTop < 0);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const navHomeButton = document.getElementById('nav-home-button');
    const navLetters = navHomeButton.querySelectorAll('.nav-app-name-letter');
    let navLetterAnimation;
    let navLogoAnimation;

    function animateNavLogo() {
      if (navLogoAnimation) navLogoAnimation.pause();
      navLogoAnimation = anime({
        targets: '#nav-home-button-logo',
        translateY: [
          { value: -2, duration: 500 },
          { value: 0, duration: 500 },
          { value: 2, duration: 500 },
          { value: 0, duration: 500 }
        ],
        easing: 'linear',
        loop: true,
      });
    }

    function animateNavLogoBackToDefault() {
      if (navLogoAnimation) navLogoAnimation.pause();
      navLogoAnimation = anime({
        targets: '#nav-home-button-logo',
        translateY: 0,
        easing: 'spring(1, 80, 10, 0)',
        duration: 500,
        complete: () => {
          anime.remove('#nav-home-button-logo');
        }
      });
    }

    const animateNavLetters = () => {
      if (navLetterAnimation) navLetterAnimation.pause();
      navLetterAnimation = anime({
        targets: navLetters,
        color: [
          { value: '#FF0000' }, // Red
          { value: '#FF7F00' }, // Orange
          { value: '#FFFF00' }, // Yellow
          { value: '#00FF00' }, // Green
          { value: '#0000FF' }, // Blue
          { value: '#4B0082' }, // Indigo
          { value: '#9400D3' }, // Violet
          { value: '#000000' }, // Back to black
        ],
        easing: 'linear',
        duration: 2500,
        loop: 1,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: function() {
          animateNavLetters();
        },
      });
    };

    const animateNavBackToBlack = () => {
      if (navLetterAnimation) navLetterAnimation.pause();
      navLetterAnimation = anime({
        targets: navLetters,
        color: '#000000',
        easing: 'linear',
        duration: 500,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: () => {
          anime.remove(navLetters);
        }
      });
    };

    navHomeButton.addEventListener('mouseover', () => {
      animateNavLogo();
      animateNavLetters();
    });

    navHomeButton.addEventListener('mouseout', () => {
      animateNavLogoBackToDefault();
      animateNavBackToBlack();
    });

    return () => {
      navHomeButton.removeEventListener('mouseover', animateNavLogo);
      navHomeButton.removeEventListener('mouseout', animateNavLogoBackToDefault);
    };
  }, [showHomeInNav]);

  useEffect(() => {
    const homeButton = document.getElementById('home-button');
    const letters = homeButton.querySelectorAll('.app-name-letter');
    let letterAnimation;
    let logoAnimation;

    function animateLogo() {
      if (logoAnimation) logoAnimation.pause();
      logoAnimation = anime({
        targets: '#home-button-logo',
        translateY: [
          { value: -2.5, duration: 500 },
          { value: 0, duration: 500 },
          { value: 2.5, duration: 500 },
          { value: 0, duration: 500 }
        ],
        easing: 'linear',
        loop: true,
      });
    }

    function animateLogoBackToDefault() {
      if (logoAnimation) logoAnimation.pause();
      logoAnimation = anime({
        targets: '#home-button-logo',
        translateY: 0,
        easing: 'spring(1, 80, 10, 0)',
        duration: 500,
        complete: () => {
          anime.remove('#home-button-logo');
        }
      });
    }

    const animateLetters = () => {
      if (letterAnimation) letterAnimation.pause();
      letterAnimation = anime({
        targets: letters,
        color: [
          { value: '#FF0000' }, // Red
          { value: '#FF7F00' }, // Orange
          { value: '#FFFF00' }, // Yellow
          { value: '#00FF00' }, // Green
          { value: '#0000FF' }, // Blue
          { value: '#4B0082' }, // Indigo
          { value: '#9400D3' }, // Violet
          { value: '#000000' }, // Back to black
        ],
        easing: 'linear',
        duration: 2500,
        loop: 1,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: function() {
          animateLetters();
        },
      });
    };

    const animateBackToBlack = () => {
      if (letterAnimation) letterAnimation.pause();
      letterAnimation = anime({
        targets: letters,
        color: '#000000',
        easing: 'linear',
        duration: 500,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: () => {
          anime.remove(letters);
        }
      });
    };

    homeButton.addEventListener('mouseover', () => {
      animateLogo();
      animateLetters();
    });

    homeButton.addEventListener('mouseout', () => {
      animateLogoBackToDefault();
      animateBackToBlack();
    });

    return () => {
      homeButton.removeEventListener('mouseover', animateLogo);
      homeButton.removeEventListener('mouseout', animateLogoBackToDefault);
    };
  }, []);

  useEffect(() => {
    if (descriptionRef.current) {
      setDescriptionHeight(Math.max(descriptionHeight, descriptionRef.current.scrollHeight, 100)); // Set a minimum height of 100px
    }
  }, [selectedAgent]);


  return (
    <div className="min-h-screen flex flex-col">
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`transition-all duration-300 ${showHomeInNav ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
                <button id="nav-home-button" className="flex items-center focus:outline-none">
                  <img id="nav-home-button-logo" src="/Images/UI/LogoDarkLargeNoBG.svg" alt="Home" className="w-8 h-8 mr-2" />
                  <span className="italic text-xl whitespace-nowrap">
                    {'HappyPrism'.split('').map((letter, index) => (
                      <span key={index} className="nav-app-name-letter">{letter}</span>
                    ))}
                  </span>
                </button>
              </div>
              <Link to="/about" className="text-gray-800 hover:text-gray-600">About</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-800 hover:text-gray-600">Login</Link>
              <Link to="/signup" className="custom-gradient text-white font-bold p-2 rounded">
                <span className='relative z-20'>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-grow custom-gradient overflow-y-auto z-10">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center mt-16 z-20 relative">
          <header ref={headerRef} className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 mb-16 inline-flex flex-col items-center mx-auto">
            <div className={`flex items-center justify-center mb-4 transition-all duration-300 ${showHomeInNav ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}`}>
              <button id="home-button" className="flex items-center focus:outline-none">
                <img id="home-button-logo" src="/Images/UI/LogoDarkLargeNoBG.svg" alt="Home" className="w-24 h-24 mr-4" />
                <span id="app-name" className="text-5xl font-bold">
                  {'HappyPrism'.split('').map((letter, index) => (
                    <span key={index} className="app-name-letter">{letter}</span>
                  ))}
                </span>
              </button>
            </div>
            <p className="text-2xl text-center">Experience Every Color of Wellbeing</p>
          </header>

          <main className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 max-w-4xl mx-auto mb-16 w-full md:w-auto md:max-w-4xl">
            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Unlock Your Full Potential with Dimensional Wellness</h2>
              <p className="text-gray-700 mb-4">
                HappyPrism is a tool designed to help you achieve balance and fulfillment across all dimensions of your life. Our innovative approach combines the power of AI with the concept of dimensional wellness.
              </p>
              <p className="text-sm text-gray-500 italic text-center mb-4">Click a dimension below to learn more about it.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {dimensions.map((dimension) => (
                  <button
                    key={dimension.name}
                    onClick={() => handleDimensionSelect(dimension)}
                    className={`${dimension.color} rounded-lg p-4 text-center transition-all duration-300 ${selectedDimension?.name === dimension.name ? 'scale-105 shadow-lg' : 'scale-100 opacity-70'}`}
                  >
                    <p className="font-medium">{dimension.name} <span className='shadow-text'>{dimension.emoji}</span></p>
                  </button>
                ))}
              </div>
              {selectedDimension && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-center">{selectedDimension.name} <span className='shadow-text'>{selectedDimension.emoji}</span></h3>
                  <p className="text-center">{selectedDimension.description}</p>
                </div>
              )}
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Meet Your AI Companions</h2>
              <p className="text-gray-700 mb-4">
                Our team of specialized AI agents is here to support you on your wellness journey. Each agent is an expert in their dimension, ready to provide personalized guidance and support.
              </p>
              <p className="text-sm text-gray-500 italic text-center mb-4">Click an AI Agent below to learn more about them.</p>
              <div className="mb-6">
                <img src={selectedAgent.image} alt={selectedAgent.name} className="w-32 h-32 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-2">{selectedAgent.name}</h3>
                <div style={{ minHeight: `${Math.max(descriptionHeight, 100)}px` }} className="transition-all duration-300 ease-in-out">
                  <p ref={descriptionRef} className="text-gray-700 text-center">{selectedAgent.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8"> {/* Added mt-8 for extra space */}
                {aiAgents.map((agent) => (
                  <button
                    key={agent.name}
                    onClick={() => handleAgentSelect(agent)}
                    className={`text-center transition-all duration-300 ${selectedAgent.name === agent.name ? 'scale-110' : 'scale-100 opacity-70'}`}
                  >
                    <img src={agent.image} alt={agent.name} className="w-16 h-16 mx-auto mb-2" />
                    <p className="font-medium">{agent.name}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Key Features</h2>
              {features.map((feature, index) => (
                <div key={feature.title} className="mb-8">
                  {feature.title === 'The HappyPrism Process' && isMobile ? (
                    // Mobile layout for HappyPrism Process (unchanged)
                    <div className="flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-700">{feature.description}</p>
                        <p className="text-sm text-gray-500 italic mt-2">Click a step to learn more about it.</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center py-4">
                        <feature.animation onStepClick={setSelectedStep} />
                      </div>
                      {selectedStep && (
                        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                          <h4 className="font-semibold mb-2">
                            {selectedStep.step} {selectedStep.emoji}
                          </h4>
                          <p>{selectedStep.sentence}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Desktop layout for all features and mobile layout for non-HappyPrism Process features
                    <div className={`flex items-start ${index % 2 !== 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-1/2 ${index % 2 !== 0 ? 'pr-4' : 'pl-4'}`}>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-700">{feature.description}</p>
                        {feature.title === 'The HappyPrism Process' && (
                          <>
                            <p className="text-sm text-gray-500 italic mt-2 mb-4">Click a step to learn more about it.</p>
                            {selectedStep && (
                              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                                <h4 className="font-semibold mb-2">
                                  {selectedStep.step} {selectedStep.emoji}
                                </h4>
                                <p>{selectedStep.sentence}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="w-1/2 bg-gray-100 rounded-lg flex items-center justify-center py-4">
                        {feature.title === 'The HappyPrism Process' 
                          ? <feature.animation onStepClick={setSelectedStep} />
                          : <feature.animation words={feature.smartWords} />
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            <div className="flex justify-center space-x-4">
              <Link 
                to="/signup" 
                className="custom-gradient text-white text-xl font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
              >
              <span className='relative z-20'>Get Started Now</span>
              </Link>
            </div>
          </main>

          <footer className="text-center text-white pb-8">
            <p className="shadow-text">&copy; 2024 HappyPrism. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;