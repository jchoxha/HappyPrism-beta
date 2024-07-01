import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import GoalCard from './GoalCard';
import NewGoalForm from './newGoalForm.js';
import { Goal, Milestone } from './goal.js';
import { Button, PlusCircle } from '../UIComponents.js';

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    (() => {
      const challengeGoal1 = new Goal("Complete a Marathon", "🏃‍♂️", "challenge", new Date("2024-01-01"), new Date("2024-12-31"));
      challengeGoal1.milestones = [
        new Milestone("Run 5K", "🏃", true, new Date("2024-01-01"), new Date("2024-03-31"), true, new Date("2024-03-15")),
        new Milestone("Run 10K", "🏃", true, new Date("2024-04-01"), new Date("2024-06-30"), true, new Date("2024-06-15")),
        new Milestone("Run Half Marathon", "🏃", false, new Date("2024-07-01"), new Date("2024-09-30")),
        new Milestone("Run Full Marathon", "🏅", false, new Date("2024-10-01"), new Date("2024-12-31")),
      ];
      challengeGoal1.goal_lastUpdated = new Date("2024-02-15");
      return challengeGoal1;
    })(),
    (() => {
      const challengeGoal2 = new Goal("Write a Novel", "📚", "challenge", new Date("2024-01-01"));
      challengeGoal2.milestones = [
        new Milestone("Outline Story", "✍️", true, new Date("2024-01-01"), new Date("2024-02-29"), true, new Date("2024-02-20")),
        new Milestone("Write First Draft", "📝", true, new Date("2024-03-01"), new Date("2024-08-31")),
        new Milestone("Edit and Revise", "📖", false, new Date("2024-09-01"), new Date("2024-11-30")),
        new Milestone("Publish", "🎉", false, new Date("2024-12-01"), new Date("2024-12-31")),
      ];
      challengeGoal2.goal_lastUpdated = new Date("2024-02-20");
      return challengeGoal2;
    })(),
    new Goal("Learn Spanish", "🗣️", "challenge", new Date("2024-01-01"), new Date("2024-12-31")),
    (() => {
      const challengeGoal3 = new Goal("Improve Coding Skills", "💻", "challenge", new Date("2024-01-01"), new Date("2024-12-31"));
      challengeGoal3.milestones = [
        new Milestone("Complete Python Course", "🐍", true, new Date("2024-01-01"), new Date("2024-04-30"), false, null, true),
        new Milestone("Build Web Application", "🌐", false, new Date("2024-05-01")),
        new Milestone("Contribute to Open Source", "🤝", false, new Date("2024-09-01"), new Date("2024-12-31")),
      ];
      challengeGoal3.goal_lastUpdated = new Date("2024-02-25");
      return challengeGoal3;
    })(),
    (() => {
      const habitGoal = new Goal("Workout 5 times a week", "🏋️‍♀️", "habit", new Date(), null, 40);
      habitGoal.habbit_action = "Workout";
      habitGoal.habbit_frequencyNum = 5;
      habitGoal.habbit_frequencyPeriod = "weekly";
      habitGoal.habbit_current_streakNum = 3;
      habitGoal.habbit_goal_streakNum = 12;
      habitGoal.habbit_streakPeriod = "weeks";
      return habitGoal;
    })(),
    (() => {
      const performanceGoal = new Goal("Improve Bench Press", "🏋️‍♂️", "performance", new Date(), new Date("2024-12-31"), 60);
      performanceGoal.performance_metric = "Bench Press Weight";
      performanceGoal.performance_unit = "lbs";
      performanceGoal.performance_startingValue = 135;
      performanceGoal.performance_targetValue = 225;
      performanceGoal.performance_valueHistory = [
        { date: '2024-01', value: 135 },
        { date: '2024-02', value: 145 },
        { date: '2024-03', value: 155 },
        { date: '2024-04', value: 165 },
        { date: '2024-05', value: 175 },
      ];
      return performanceGoal;
    })(),
    (() => {
      const projectGoal = new Goal("Launch Personal Website", "🌐", "project", new Date(), new Date("2024-12-31"), 30);
      projectGoal.project_tasks = {
        "To Do": [
          { name: "Design homepage", description: "Create a mockup for the homepage", contributingPercentage: 20 },
          { name: "Set up hosting", description: "Choose and set up web hosting", contributingPercentage: 10 },
        ],
        "In Progress": [
          { name: "Develop backend", description: "Implement server-side logic", contributingPercentage: 30 },
        ],
        "Done": [
          { name: "Domain registration", description: "Register a domain name", contributingPercentage: 5 },
          { name: "Create sitemap", description: "Plan out the structure of the website", contributingPercentage: 5 },
        ],
      };
      projectGoal.percentTodo = 30;
      projectGoal.percentInProgress = 30;
      projectGoal.percentComplete = 10;
      return projectGoal;
    })(),
    new Goal("Become Physically Fit", "💪", "transformation", new Date(), new Date("2024-12-31"), 65),
  ]);

  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  const addNewGoal = (goalData) => {
    const newGoal = new Goal(
      goalData.goal_name,
      goalData.goal_emoji,
      goalData.goal_type,
      new Date(),
      goalData.goal_deadline,
      0,
      goalData.milestones || [],
      goalData.goal_habitData || {},
      goalData.goal_performanceData || [],
      goalData.goal_projectData || {},
      goalData.goal_subGoals || []
    );
    setGoals([...goals, newGoal]);
    setShowNewGoalForm(false);
  };

  const cancelNewGoal = () => {
    setShowNewGoalForm(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button onClick={() => setShowNewGoalForm(true)} className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded">
          <PlusCircle /> Add New Goal
        </Button>
        {showNewGoalForm && (
          <div className="mt-4">
            <NewGoalForm onSubmit={addNewGoal} onCancel={cancelNewGoal} existingGoals={goals} />
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal, index) => (
          <GoalCard key={index} goal={goal} />
        ))}
      </div>
    </div>
  );
};

function drawGoals() {
  const goalsContainer = document.getElementById('dashboard-goals');
  if (goalsContainer) {
    const root = createRoot(goalsContainer);
    root.render(<GoalsPage />);
  } else {
    console.error("Could not find 'dashboard-goals' element.");
  }
}

export { drawGoals };
