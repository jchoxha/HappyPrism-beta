import React, { useState, useEffect } from 'react';
import FilterMenu from './FilterMenu';

const GoalPicker = ({ goals, onSelect, onCancel, initialFilter }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filteredGoals, setFilteredGoals] = useState(goals);
  const [filters, setFilters] = useState({
    status: {
      'Not Yet Started': true,
      'In Progress': true,
      'Completed': true
    }
  });

  useEffect(() => {
    setFilteredGoals(goals);
  }, [goals]);

  const handleSelect = () => {
    if (selectedGoal) {
      onSelect(selectedGoal);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="goal-picker bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Select a pre-existing goal</h3>
          <p className="text-sm text-gray-500">
            {initialFilter !== 'None' 
              ? `Only showing goals with a status of '${initialFilter}'`
              : 'Showing all available goals'}
          </p>
        </div>
        <FilterMenu 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          disabledFilters={['status']}
        />
      </div>
      <select
        value={selectedGoal ? selectedGoal.goal_name : ''}
        onChange={(e) => {
          const selectedName = e.target.value;
          const goal = filteredGoals.find(g => g.goal_name === selectedName);
          setSelectedGoal(goal);
        }}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      >
        <option value="">Select a goal</option>
        {filteredGoals.map(goal => (
          <option key={goal.goal_name} value={goal.goal_name}>
            {goal.goal_emoji} {goal.goal_name} - {goal.status}
          </option>
        ))}
      </select>
      <div className="flex justify-end space-x-2">
        <button 
          onClick={handleSelect} 
          disabled={!selectedGoal}
          className="dimension-theme-colored px-4 py-2 rounded disabled:opacity-50"
        >
          Select
        </button>
        <button 
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GoalPicker;