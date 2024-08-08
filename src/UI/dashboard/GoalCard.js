import React, { useState, useEffect } from 'react';
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
  Trello,
  ProjectBoard
} from '../UIComponents';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Theme } from '../theme.js';
import { useDimension } from '../DimensionContext';

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

const dimensionColors = {
  Spiritual: '🟡',
  Mental: '🟠',
  Physical: '🔴',
  Social: '🔵',
  Vocational: '🟣',
  Environmental: '🟢'
};

const GoalCard = ({ goal, showUpdateButton = true }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const { currentDimension } = useDimension();
  const theme = new Theme();

  useEffect(() => {
    theme.updateThemeForNode({ dimensionName: currentDimension });
  }, [currentDimension]);

  const formatDate = (date) => {
    return format(new Date(date), 'PP');
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

  const renderMilestones = (milestones) => (
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
                  <PlayButton />
                ) : (
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

  const handleCardClick = (task) => {
    console.log('Card clicked:', task);
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
            <div className={`text-sm font-semibold ${getStatusColor(goal.status)}`}>
              Status: {goal.status}
            </div>
            <div className="dimension-indicators mt-2">
              {Object.entries(goal.dimensions).map(([dimension, isAssociated]) => 
                isAssociated && (
                  <span key={dimension} title={dimension} className="mr-1">
                    {dimensionColors[dimension]}
                  </span>
                )
              )}
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
              <span className="ml-2">{`${goal.habit_frequencyNum || 0} times ${goal.habit_frequencyPeriod || 'N/A'}`}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Current streak:</span>
              <span className="font-bold">{goal.habit_current_streakNum || 0} {goal.habit_streakPeriod || 'days'}</span>
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
            {/* <ProjectBoard
              columns={[
                { title: 'To Do', tasks: goal.project_tasks['To Do']?.map(task => ({ ...task, name: task.task_name, emoji: task.task_emoji })) || [] },
                { title: 'In Progress', tasks: goal.project_tasks['In Progress']?.map(task => ({ ...task, name: task.task_name, emoji: task.task_emoji })) || [] },
                { title: 'Done', tasks: goal.project_tasks['Done']?.map(task => ({ ...task, name: task.task_name, emoji: task.task_emoji })) || [] },
              ]}
              onCardClick={handleCardClick}
            /> */}
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
            <button onClick={() => console.log('Update goal:', goal.goal_name)} className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded">
              Update
            </button>
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
