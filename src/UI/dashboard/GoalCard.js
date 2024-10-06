import React, { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
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
import { use } from 'passport';


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
  Social: '🟣',
  Vocational: '🔵',
  Environmental: '🟢'
};

const dimensionOrder = ['Spiritual', 'Mental', 'Physical', 'Social', 'Vocational', 'Environmental'];

const GoalCard = ({ goal, showUpdateButton = true }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const { currentDimension } = useDimension();
  const theme = new Theme();

  useEffect(() => {
  }, []);

  useEffect(() => {
    theme.updateThemeForNode({ dimensionName: currentDimension });
  }, [currentDimension]);

  const formatDate = (date) => {
    return date ? format(new Date(date), 'PP') : 'Not set';
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'text-black';
    return isPast(new Date(deadline)) ? 'text-red-500' : 'text-black';
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

  const goalTypeEmojis = {
    challenge: '🏆',
    habit: '📅',
    performance: '📊',
    project: '🛠️',
    transformation: '🔄'
  };

  const StepCard = ({ children, className = "" }) => (
    <div className={`p-2 bg-white border border-gray-300 rounded-md shadow-sm ${className}`} style={{ minWidth: '80px', maxWidth: '120px' }}>
      <div className="text-xs text-center overflow-hidden overflow-ellipsis whitespace-nowrap">
        {children}
      </div>
    </div>
  );

  const renderMilestones = (milestones) => (
    <div className="flex items-center space-x-2 mt-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex-shrink-0">
        <StepCard className="bg-gray-100">Start</StepCard>
      </div>
      <ArrowRight className="flex-shrink-0 text-gray-400" />
      {milestones.map((milestone, index) => (
        <React.Fragment key={index}>
          <div className="flex-shrink-0">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedMilestone(milestone)}
            >
              <div className="mb-2">
                {milestone.status === 'Completed' ? (
                  <CheckCircle className="text-green-500" />
                ) : milestone.status === 'In Progress' ? (
                  <PlayButton className="text-blue-500" />
                ) : (
                  <Circle className="text-gray-500" />
                )}
              </div>
              <StepCard>
                {milestone.pre_existing_goal ? milestone.pre_existing_goal.goal_name : milestone.name}
              </StepCard>
              <div className="flex items-center mt-1">
                {milestone.hasDeadline && milestone.deadline && (
                  <Clock className={`text-xs mr-1 ${isPast(new Date(milestone.deadline)) ? 'text-red-500' : 'text-gray-500'}`} />
                )}
                {milestone.pre_existing_goal && (
                  <span className="text-xs" title={`${milestone.pre_existing_goal.goal_type} goal`}>
                    {goalTypeEmojis[milestone.pre_existing_goal.goal_type]}
                  </span>
                )}
              </div>
            </div>
          </div>
          {index < milestones.length - 1 && (
            <ArrowRight className="flex-shrink-0 text-gray-400" />
          )}
        </React.Fragment>
      ))}
      <ArrowRight className="flex-shrink-0 text-gray-400" />
      <div className="flex-shrink-0">
        <StepCard className="bg-gray-100">
          End
        </StepCard>
      </div>
    </div>
  );

  const handleCardClick = (task) => {
  };

  const getCompletedMilestonesCount = (milestones) => {
    return milestones.filter(milestone => milestone.status === 'Completed').length;
  };

  const formatGoalType = (goal) => {
    if (goal.goal_type !== 'habit') return goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1);

    const { habit_frequencyNum, habit_frequencyPeriod } = goal;
    
    if (habit_frequencyNum === 1) {
      return `${habit_frequencyPeriod.charAt(0).toUpperCase() + habit_frequencyPeriod.slice(1)}ly Habit`;
    }
    
    if (habit_frequencyNum === 2) {
      return `Twice ${habit_frequencyPeriod}ly Habit`;
    }
    
    return `${habit_frequencyNum} Times per ${habit_frequencyPeriod} Habit`;
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{goal.goal_name}</CardTitle>
            <div className="text-sm">{formatGoalType(goal)}</div>
            <div className="text-sm text-gray-500">
              <p>Created: {formatDate(goal.goal_startDate)}</p>
              <p>Last Modified: {formatDate(goal.goal_lastUpdated || goal.goal_startDate)}</p>
            </div>
            <div className={`text-sm font-semibold ${getStatusColor(goal.status)}`}>
              Status: {goal.status}
            </div>
            <div className="text-sm mt-2">
              {goal.goal_startDate && <p>Started: {formatDate(goal.goal_startDate)}</p>}
              {goal.goal_completedDate && <p>Completed: {formatDate(goal.goal_completedDate)}</p>}
              {goal.goal_deadline && (
                <p className={getDeadlineColor(goal.goal_deadline)}>
                  Deadline: {formatDate(goal.goal_deadline)}
                </p>
              )}
            </div>
            <div className="dimension-indicators mt-2">
              {dimensionOrder.map(dimension => 
                goal.dimensions[dimension] && (
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
        {goal.goal_type === 'challenge' && (
          <div className="mt-2">
            {goal.milestones && goal.milestones.length > 0 ? (
              <>
                <p>{getCompletedMilestonesCount(goal.milestones)}/{goal.milestones.length} milestones complete</p>
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
            {/* Project board rendering code remains the same */}
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
