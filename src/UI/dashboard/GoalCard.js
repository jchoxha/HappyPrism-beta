import React, { useState } from 'react';
import { format } from 'date-fns';
import MilestonePopup from './MilestonePopup';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Progress,
  PlusCircle,
  CheckCircle,
  Star,
  PlayButton,
  Circle,
  ArrowRight,
  Clock,
  Calendar,
  TrendingUp,
  Trello
} from '../UIComponents';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

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

const GoalCard = ({ goal, showUpdateButton = true }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const formatDate = (date) => {
    return format(new Date(date), 'PP');
  };

  const renderMilestones = (milestones) => {
    return (
      <div className="flex items-center space-x-2 mt-2">
        {milestones.map((milestone, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ArrowRight />}
            {milestone.isPreExisting ? (
              <GoalCard key={milestone.linkedGoalId} goal={milestone} showUpdateButton={false} />
            ) : (
              <div 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className="mb-1">
                  {milestone.completed ? (
                    <CheckCircle />
                  ) : milestone.pre_existing_goal ? (
                    <Star />
                  ) : milestone.milestone_started ? (
                    <PlayButton /> ) : (
                    <Circle />
                  )}
                </div>
                {!milestone.completed && milestone.deadline && (
                  <Clock className="text-xs" />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{goal.goal_name}</CardTitle>
            <div className="text-sm">{goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}</div>
            <div className="text-sm text-gray-500">
              <p>Created: {formatDate(goal.goal_startDate)}</p>
              <p>Last Modified: {formatDate(goal.goal_lastUpdated || goal.goal_startDate)}</p>
            </div>
          </div>
          <div className="text-4xl">{goal.goal_emoji}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">
          {goal.goal_deadline && <p>Deadline: {formatDate(goal.goal_deadline)}</p>}
        </div>

        {goal.goal_type === 'challenge' && (
          <div className="mt-2">
            {goal.milestones && goal.milestones.length > 0 ? (
              <>
                <p>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones complete</p>
                {renderMilestones(goal.milestones)}
              </>
            ) : (
              <p>No milestones set for this challenge</p>
            )}
          </div>
        )}

        {goal.goal_type === 'habit' && (
          <div className="mt-2">
            <div className="flex items-center mb-2">
              <Calendar />
              <span className="ml-2">{`${goal.habbit_frequencyNum || 0} times ${goal.habbit_frequencyPeriod || 'N/A'}`}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Current streak:</span>
              <span className="font-bold">{goal.habbit_current_streakNum || 0} {goal.habbit_streakPeriod || 'days'}</span>
            </div>
          </div>
        )}

        {goal.goal_type === 'performance' && goal.performance_valueHistory && goal.performance_valueHistory.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center mb-2">
              <TrendingUp />
              <span className="ml-2">Performance over time</span>
            </div>
            <PerformanceChart data={goal.performance_valueHistory} />
          </div>
        )}

        {goal.goal_type === 'project' && goal.project_tasks && (
          <div className="mt-2">
            <div className="flex items-center mb-2">
              <Trello />
              <span className="ml-2">Project Board</span>
            </div>
            <ProjectBoard columns={[
              { title: 'To Do', tasks: goal.project_tasks['To Do']?.map(task => task.name) || [] },
              { title: 'In Progress', tasks: goal.project_tasks['In Progress']?.map(task => task.name) || [] },
              { title: 'Done', tasks: goal.project_tasks['Done']?.map(task => task.name) || [] },
            ]} />
          </div>
        )}

        {goal.goal_type === 'transformation' && goal.subGoals && goal.subGoals.length > 0 && (
          <div className="mt-2">
            <div className="font-bold mb-2">Sub-goals:</div>
            <ul>
              {goal.subGoals.map((subGoal, index) => (
                <li key={index}>{subGoal.goal_name} - {subGoal.percentComplete}% complete</li>
              ))}
            </ul>
          </div>
        )}
        {showUpdateButton && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => console.log('Update goal:', goal.goal_name)} className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded">
              Update
            </Button>
          </div>
        )}
      </CardContent>
      {selectedMilestone && (
        <MilestonePopup 
          milestone={selectedMilestone} 
          onClose={() => setSelectedMilestone(null)} 
        />
      )}
    </Card>
  );
};

export default GoalCard;
