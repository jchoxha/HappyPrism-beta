import React, { useState } from 'react';
import HabitScheduler from '../../UI/dashboard/HabitScheduler.js';

const HabitSchedulerTestPage = () => {
  const [habitData, setHabitData] = useState({
    habit_action: "Exercise",
    habit_frequencyPeriod: "daily",
    habit_frequencyNum: 4,
    scheduleActions: []
  });

  const handleHabitDataChange = (newData) => {
    setHabitData(newData);
  };

  return (
    <div className="habit-scheduler-test-page">
      <h1>Habit Scheduler Test Page</h1>
      <div className="habit-info">
        <h2>Current Habit: {habitData.habit_action}</h2>
        <p>Frequency: {habitData.habit_frequencyNum} times {habitData.habit_frequencyPeriod}</p>
      </div>
      <HabitScheduler 
        habitData={habitData} 
        onHabitDataChange={handleHabitDataChange} 
      />
    </div>
  );
};

export default HabitSchedulerTestPage;