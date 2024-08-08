import React, { useState, useEffect } from 'react';
import GoalCard from './GoalCard.js';
import NewGoalForm from './newGoalForm.js';
import { Goal, Milestone, ProjectTask, SubGoal } from './goal.js';
import { useDimension } from '../DimensionContext';
import { Theme } from '../theme.js';
import { v4 as uuidv4 } from 'uuid';

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    (() => {
      const challengeGoal1 = new Goal("Complete a Marathon", "🏃‍♂️", "challenge", new Date("2024-01-01"), new Date("2024-12-31"));
      challengeGoal1.id = uuidv4();
      challengeGoal1.status = "In Progress";
      challengeGoal1.milestones = [
        new Milestone("Run 5K", "🏃", true, new Date("2024-01-01"), new Date("2024-03-31"), true, new Date("2024-03-15")),
        new Milestone("Run 10K", "🏃", true, new Date("2024-04-01"), new Date("2024-06-30"), true, new Date("2024-06-15")),
        new Milestone("Run Half Marathon", "🏃", false, new Date("2024-07-01"), new Date("2024-09-30")),
        new Milestone("Run Full Marathon", "🏅", false, new Date("2024-10-01"), new Date("2024-12-31")),
      ];
      challengeGoal1.goal_lastUpdated = new Date("2024-02-15");
      challengeGoal1.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: true,
        Social: false,
        Vocational: false,
        Environmental: false
      };
      return challengeGoal1;
    })(),
    (() => {
      const challengeGoal2 = new Goal("Write a Novel", "📚", "challenge", new Date("2024-01-01"));
      challengeGoal2.id = uuidv4();
      challengeGoal2.status = "In Progress";
      challengeGoal2.milestones = [
        new Milestone("Outline Story", "✍️", true, new Date("2024-01-01"), new Date("2024-02-29"), true, new Date("2024-02-20")),
        new Milestone("Write First Draft", "📝", true, new Date("2024-03-01"), new Date("2024-08-31")),
        new Milestone("Edit and Revise", "📖", false, new Date("2024-09-01"), new Date("2024-11-30")),
        new Milestone("Publish", "🎉", false, new Date("2024-12-01"), new Date("2024-12-31")),
      ];
      challengeGoal2.goal_lastUpdated = new Date("2024-02-20");
      challengeGoal2.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: false,
        Social: false,
        Vocational: true,
        Environmental: false
      };
      return challengeGoal2;
    })(),
    (() => {
      const challengeGoal3 = new Goal("Learn Spanish", "🗣️", "challenge", new Date("2024-01-01"), new Date("2024-12-31"));
      challengeGoal3.id = uuidv4();
      challengeGoal3.status = "Not Yet Started";
      challengeGoal3.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: false,
        Social: true,
        Vocational: true,
        Environmental: false
      };
      return challengeGoal3;
    })(),
    (() => {
      const challengeGoal4 = new Goal("Improve Coding Skills", "💻", "challenge", new Date("2024-01-01"), new Date("2024-12-31"));
      challengeGoal4.id = uuidv4();
      challengeGoal4.status = "In Progress";
      challengeGoal4.milestones = [
        new Milestone("Complete Python Course", "🐍", true, new Date("2024-01-01"), new Date("2024-04-30"), false, null, true),
        new Milestone("Build Web Application", "🌐", false, new Date("2024-05-01")),
        new Milestone("Contribute to Open Source", "🤝", false, new Date("2024-09-01"), new Date("2024-12-31")),
      ];
      challengeGoal4.goal_lastUpdated = new Date("2024-02-25");
      challengeGoal4.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: false,
        Social: false,
        Vocational: true,
        Environmental: false
      };
      return challengeGoal4;
    })(),
    (() => {
      const habitGoal = new Goal("Workout 5 times a week", "🏋️‍♀️", "habit", new Date(), null, 40);
      habitGoal.id = uuidv4();
      habitGoal.status = "In Progress";
      habitGoal.habit_action = "Workout";
      habitGoal.habit_frequencyNum = 5;
      habitGoal.habit_frequencyPeriod = "weekly";
      habitGoal.habit_current_streakNum = 3;
      habitGoal.habit_goal_streakNum = 12;
      habitGoal.habit_streakPeriod = "weeks";
      habitGoal.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: true,
        Social: false,
        Vocational: false,
        Environmental: false
      };
      return habitGoal;
    })(),
    (() => {
      const performanceGoal = new Goal("Improve Bench Press", "🏋️‍♂️", "performance", new Date(), new Date("2024-12-31"), 60);
      performanceGoal.id = uuidv4();
      performanceGoal.status = "In Progress";
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
      performanceGoal.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: true,
        Social: false,
        Vocational: false,
        Environmental: false
      };
      return performanceGoal;
    })(),
    (() => {
      const projectGoal = new Goal("Launch Personal Website", "🌐", "project", new Date(), new Date("2024-12-31"), 30);
      projectGoal.id = uuidv4();
      projectGoal.status = "In Progress";
      projectGoal.project_tasks = [
        new ProjectTask("Design homepage", "📐", "To Do", "New Task", null, null, 20, "Create a mockup for the homepage"),
        new ProjectTask("Set up hosting", "💻", "To Do", "New Task", null, null, 10, "Choose and set up web hosting"),
        new ProjectTask("Develop backend", "🖥️", "In Progress", "New Task", null, null, 30, "Implement server-side logic"),
        new ProjectTask("Domain registration", "🌐", "Done", "New Task", null, null, 5, "Register a domain name"),
        new ProjectTask("Create sitemap", "🗺️", "Done", "New Task", null, null, 5, "Plan out the structure of the website")
      ];
      projectGoal.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: false,
        Social: false,
        Vocational: true,
        Environmental: false
      };
      return projectGoal;
    })(),
    (() => {
      const transformationGoal = new Goal("Become Physically Fit", "💪", "transformation", new Date(), new Date("2024-12-31"), 65);
      transformationGoal.id = uuidv4();
      transformationGoal.status = "In Progress";
      transformationGoal.subGoals = [
        new SubGoal(
          new Goal("Complete a Fitness Program", "🏋️‍♀️", "challenge", new Date(), new Date("2024-06-30")),
          50
        ),
        new SubGoal(
          new Goal("Participate in a Marathon", "🏃‍♂️", "challenge", new Date(), new Date("2024-10-31")),
          50
        )
      ];
      transformationGoal.dimensions = {
        Spiritual: false,
        Mental: true,
        Physical: true,
        Social: false,
        Vocational: false,
        Environmental: false
      };
      return transformationGoal;
    })(),
  ]);

  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const { currentDimension, dimensionMap } = useDimension();
  const theme = new Theme();

  useEffect(() => {
    theme.updateThemeForNode({ dimensionName: currentDimension });
  }, [currentDimension]);


  const addNewGoal = (goalData) => {
    const newGoal = new Goal(
      goalData.goal_name,
      goalData.goal_emoji,
      goalData.goal_type,
      goalData.goal_startDate,
      goalData.goal_deadline,
      goalData.milestones || [],
      goalData.goal_habitData || {},
      goalData.goal_performanceData || {},
      goalData.goal_projectData || { tasks: [] },
      goalData.goal_subGoals || [],
      goalData.goal_transformationData || { subGoals: [], totalPercentComplete: 0 },
      goalData.dimensions // Include the dimensions data
    );
    newGoal.id = uuidv4();
    newGoal.status = goalData.status || "Not Yet Started";
    newGoal.goal_lastUpdated = new Date();
    setGoals([...goals, newGoal]);
    setShowNewGoalForm(false);
  };

  const cancelNewGoal = () => {
    setShowNewGoalForm(false);
  };

  const filteredGoals = goals.filter(goal => {
    if (currentDimension === 'Spectrum') {
      return true; 
    }
    const relevantDimension = dimensionMap[currentDimension];
    return goal.dimensions[relevantDimension];
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <button onClick={() => setShowNewGoalForm(true)} className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded">
          Add New Goal
        </button>
        {showNewGoalForm && (
          <div className="mt-4">
            <NewGoalForm onSubmit={addNewGoal} onCancel={cancelNewGoal} existingGoals={goals} />
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map((goal, index) => (
          <GoalCard key={index} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default GoalsPage;