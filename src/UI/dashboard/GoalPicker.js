import React, { useState, useEffect } from 'react';
import { FilterIcon } from 'lucide-react';

const GoalPicker = ({
  goals,
  onSelect,
  onCancel,
  presetFilters = {},
  disabledFilters = []
}) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Define filter types internally with custom display names and order
  const filterTypes = {
    Dimensions: ['Spiritual', 'Mental', 'Physical', 'Social', 'Vocational', 'Environmental'],
    Status: ['Not Yet Started', 'In Progress', 'Completed'],
    'Goal Type': ['Challenge', 'Habit', 'Performance', 'Project', 'Transformation']
  };

  const dimensionColors = {
    Spiritual: '🟡',
    Mental: '🟠',
    Physical: '🔴',
    Social: '🟣',
    Vocational: '🔵',
    Environmental: '🟢'
  };

  const goalTypes = [
    { value: 'challenge', label: 'Challenge', emoji: '🏆' },
    { value: 'habit', label: 'Habit', emoji: '📅' },
    { value: 'performance', label: 'Performance', emoji: '📊' },
    { value: 'project', label: 'Project', emoji: '🛠️' },
    { value: 'transformation', label: 'Transformation', emoji: '🔄' },
  ];

  // Detect if the screen size is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check on component mount
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [filters, setFilters] = useState(() => {
    const initialFilters = {};
    Object.keys(filterTypes).forEach(type => {
      if (presetFilters[type]) {
        initialFilters[type] = filterTypes[type].reduce((acc, value) => {
          acc[value] = presetFilters[type] === value;
          return acc;
        }, {});
      } else {
        initialFilters[type] = filterTypes[type].reduce((acc, value) => {
          acc[value] = true;
          return acc;
        }, {});
      }
    });
    return initialFilters;
  });
  

  const filterGoals = (goals) => {
    const newFilteredGoals = goals.filter(goal => {
      const isPassing = Object.entries(filters).every(([filterType, filterValues]) => {

        if (filterType === 'Status') {
          if (goal.status === 'Not Yet Started' && !filterValues['Not Yet Started']) {
            return false;
          }
          if (goal.status === 'In Progress' && !filterValues['In Progress']) {
            return false;
          }
          if (goal.status === 'Completed' && !filterValues['Completed']) {
            return false;
          }
        } else if (filterType === 'Dimensions') {
          if (
            !(goal.dimensions.Spiritual && filterValues['Spiritual']) &&
            !(goal.dimensions.Mental && filterValues['Mental']) &&
            !(goal.dimensions.Physical && filterValues['Physical']) &&
            !(goal.dimensions.Social && filterValues['Social']) &&
            !(goal.dimensions.Vocational && filterValues['Vocational']) &&
            !(goal.dimensions.Environmental && filterValues['Environmental'])
          ) {
            return false;
          }
        } else if (filterType === 'Goal Type') {
          if (goal.goal_type === 'Challenge' && !filterValues['Challenge']) {
            return false;
          }
          if (goal.goal_type === 'Habit' && !filterValues['Habit']) {
            return false;
          }
          if (goal.goal_type === 'Performance' && !filterValues['Performance']) {
            return false;
          }
          if (goal.goal_type === 'Project' && !filterValues['Project']) {
            return false;
          }
          if (goal.goal_type === 'Transformation' && !filterValues['Transformation']) {
            return false;
          }
        }

        return true;
      });

      return isPassing;
    });

    return newFilteredGoals;
  };

  const [filteredGoals, setFilteredGoals] = useState(filterGoals(goals));

  useEffect(() => {
    setFilteredGoals(filterGoals(goals));
  }, [filters, goals]);

  const handleSelect = (goal) => {
    setSelectedGoal(goal);
    onSelect(goal);
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: {
        ...prevFilters[filterType],
        [value]: !prevFilters[filterType][value]
      }
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Yet Started':
        return 'text-gray-500';
      case 'In Progress':
        return 'text-blue-500';
      case 'Completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDimensionsString = (dimensions) => {
    return Object.keys(dimensions)
      .filter(dimension => dimensions[dimension])
      .map(dimension => dimensionColors[dimension])
      .join(' ');
  };

  const getGoalTypeString = (goalType) => {
    const goalTypeObj = goalTypes.find(type => type.value.toLowerCase() === goalType.toLowerCase());
    return goalTypeObj ? `${goalTypeObj.label} ${goalTypeObj.emoji}` : goalType;
  };

  const renderFilterMenu = () => (
    <div
      className={`relative bg-white p-4 border rounded-lg shadow-xl z-40 top-0 ${isMobile ? 'w-full h-full top-0 left-0' : 'right-0  w-64'}`}
      style={{ left: isMobile ? '0' : 'calc(100% + 80px)' }}
    >
      <h2 className="text-lg font-semibold mb-2">Filters</h2>
      {Object.entries(filterTypes).map(([filterType, values]) => (
        <div key={filterType} className="mb-2">
          <h4 className="font-semibold mb-1">{filterType}</h4>
          <div className="flex flex-wrap gap-2">
            {values.map(value => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters[filterType][value]}
                  onChange={() => toggleFilter(filterType, value)}
                  disabled={presetFilters[filterType] !== undefined && presetFilters[filterType] !== value}
                  className="mr-1"
                />
                <span className={`text-sm ${presetFilters[filterType] !== undefined && presetFilters[filterType] !== value ? 'text-gray-400' : ''}`}>
                  {value}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {isMobile && (
        <button
          onClick={() => setIsFilterMenuOpen(false)}
          className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150 w-full"
        >
          Close Filters
        </button>
      )}
    </div>
  );
  

  return (
    <div className="relative flex">
      <div className="goal-picker bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Select a Pre-Existing Goal</h3>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFilterMenuOpen(!isFilterMenuOpen) }}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FilterIcon size={24} />
          </button>
        </div>

        <div className="h-96 overflow-y-scroll">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className={`bg-white border border-gray-300 rounded-lg p-4 shadow-sm cursor-pointer mb-4 ${selectedGoal && selectedGoal.id === goal.id ? 'border-blue-500' : ''}`}
              onClick={() => handleSelect(goal)}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{goal.goal_emoji}</span>
                <div className="ml-4 flex-grow">
                  <h4 className="font-bold text-lg">{goal.goal_name}</h4>
                  <p className="text-sm text-gray-600">Dimensions: {getDimensionsString(goal.dimensions)}</p>
                  <p className={`text-sm ${getStatusColor(goal.status)}`}>Status: {goal.status}</p>
                  <p className="text-sm text-gray-500">Type: {getGoalTypeString(goal.goal_type)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
      {isFilterMenuOpen && renderFilterMenu()}
    </div>
  );
};

export default GoalPicker;
