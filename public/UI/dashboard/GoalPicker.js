import React, { useState } from 'react';

const GoalPicker = ({ goals, onSelect, onCancel }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleSelect = () => {
    if (selectedGoal) {
      onSelect(selectedGoal);
    }
  };

  return (
    <div className="goal-picker">
      <h3>Select a pre-existing goal</h3>
      <select
        value={selectedGoal ? selectedGoal.goal_name : ''}
        onChange={(e) => {
          console.log("e: ", e, ", e.target: ", e.target, ", e.target.value: ", e.target.value)
          const selectedName = e.target.value;
          const goal = goals.find(g => g.goal_name === selectedName);
          console.log("goal: ", goal)
          setSelectedGoal(goal);
        }}
      >
        <option value="">Select a goal</option>
        {goals.map(goal => (
          <option key={goal.goal_name} value={goal.goal_name}>
            {goal.goal_name}
          </option>
        ))}
      </select>
      <div className="goal-picker-buttons">
        <button onClick={handleSelect} disabled={!selectedGoal}>Select</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default GoalPicker;
