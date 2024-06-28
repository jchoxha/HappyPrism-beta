import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Simple UI components
const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-4 py-5 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
);

const CardContent = ({ children }) => (
  <div className="px-4 py-5">{children}</div>
);

const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
  >
    {children}
  </button>
);

const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

// Simple icon components
const PlusCircle = () => <span>+</span>;
const CheckCircle = () => <span>✓</span>;
const Circle = () => <span>○</span>;
const ArrowRight = () => <span>→</span>;
const Calendar = () => <span>📅</span>;
const TrendingUp = () => <span>📈</span>;
const Trello = () => <span>📋</span>;

const PerformanceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

const ProjectBoard = ({ columns }) => (
  <div className="flex space-x-4 overflow-x-auto pb-4">
    {columns.map((column, index) => (
      <div key={index} className="flex-shrink-0 w-64 bg-gray-100 rounded p-2">
        <h3 className="font-bold mb-2">{column.title}</h3>
        {column.tasks.map((task, taskIndex) => (
          <div key={taskIndex} className="bg-white p-2 mb-2 rounded shadow">
            {task}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const GoalCard = ({ title, type, progress, milestones, habitData, performanceData, projectData }) => (
  <Card className="w-full mb-4">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <div className="text-sm text-gray-500">{type}</div>
    </CardHeader>
    <CardContent>
      {type === 'Transformation' && (
        <Progress value={progress} />
      )}
      {type === 'Challenge' && milestones && (
        <div className="flex items-center space-x-2">
          {milestones.map((milestone, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ArrowRight />}
              {milestone.completed ? (
                <CheckCircle />
              ) : (
                <Circle />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {type === 'Habit' && habitData && (
        <div>
          <div className="flex items-center mb-2">
            <Calendar />
            <span className="ml-2">{habitData.frequency}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Current streak:</span>
            <span className="font-bold">{habitData.currentStreak} days</span>
          </div>
        </div>
      )}
      {type === 'Performance' && performanceData && (
        <div>
          <div className="flex items-center mb-2">
            <TrendingUp />
            <span className="ml-2">Performance over time</span>
          </div>
          <PerformanceChart data={performanceData} />
        </div>
      )}
      {type === 'Project' && projectData && (
        <div>
          <div className="flex items-center mb-2">
            <Trello />
            <span className="ml-2">Project Board</span>
          </div>
          <ProjectBoard columns={projectData.columns} />
        </div>
      )}
    </CardContent>
  </Card>
);

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Become Physically Fit', type: 'Transformation', progress: 65 },
    { id: 2, title: 'Complete a Marathon', type: 'Challenge', milestones: [
      { completed: true },
      { completed: true },
      { completed: false },
      { completed: false },
    ]},
    { id: 3, title: 'Workout 5 times a week', type: 'Habit', habitData: {
      frequency: '5 times a week',
      currentStreak: 12,
    }},
    { id: 4, title: 'Improve Bench Press', type: 'Performance', performanceData: [
      { date: '2023-01', value: 135 },
      { date: '2023-02', value: 145 },
      { date: '2023-03', value: 155 },
      { date: '2023-04', value: 160 },
      { date: '2023-05', value: 170 },
    ]},
    { id: 5, title: 'Launch Personal Website', type: 'Project', projectData: {
      columns: [
        { title: 'To Do', tasks: ['Design homepage', 'Set up hosting'] },
        { title: 'In Progress', tasks: ['Create About Me page'] },
        { title: 'Done', tasks: ['Domain registration', 'Content planning'] },
      ]
    }},
  ]);

  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  const addNewGoal = () => {
    // Implement new goal addition logic here
    setShowNewGoalForm(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} {...goal} />
        ))}
      </div>
      <Button onClick={addNewGoal} className="mt-4">
        <PlusCircle /> Add New Goal
      </Button>
      {showNewGoalForm && (
        <div className="mt-4">
          {/* Implement new goal form here */}
          <p>New goal form placeholder</p>
        </div>
      )}
    </div>
  );
};

function drawGoals() {
  const goalsContainer = document.getElementById('dashboard-goals');
  ReactDOM.render(<GoalsPage />, goalsContainer);
}

export { drawGoals };