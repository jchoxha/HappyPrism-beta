//TO DO: IMPROVE RENDERING FOR PRETTY MUCH ALL GOAL TYPES



import React, { useState, useEffect, useRef } from 'react';
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
import { formatPerformanceValue } from './goal';
import { TransformationPieChart, COLORS } from './TransformationPieChart';
import { calculateProgress } from './goal.js';
import { Tooltip as ReactTooltip } from 'react-tooltip';



const PerformanceChart = ({ data, goal }) => {
  const DataFormater = (number) => {
    const formatNumber = (n, divisor, suffix) => {
      const value = n / divisor;
      const integerPart = Math.floor(value);
      return integerPart >= 100 ? 
        Math.round(value) + suffix :
        value.toFixed(1) + suffix;
    };
  
    if (number >= 1e12) {
      return formatNumber(number, 1e12, 'T');
    } else if (number >= 1e9) {
      return formatNumber(number, 1e9, 'B');
    } else if (number >= 1e6) {
      return formatNumber(number, 1e6, 'M');
    } else if (number >= 1e3) {
      return formatNumber(number, 1e3, 'K');
    } else {
      return number.toString();
    }
  }

  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MM/dd/yy'),
    formattedValue: formatPerformanceValue(item.value, goal.performance_unit, goal.performance_unitIsPrefix, false)
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formattedData}>
        <XAxis dataKey="date" />
        <YAxis tickFormatter={DataFormater}/>
        <Tooltip 
          formatter={(value, name, props) => [props.payload.formattedValue, 'Value']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const ProgressBar = ({ progress, className, barClassName, barStyle, dataTooltipId }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const progressBarRef = useRef(null);

  const handleMouseOver = () => {
    setTooltipContent(typeof dataTooltipId === 'function' ? dataTooltipId() : dataTooltipId);
  };

  return (
    <>
      <div 
        className={`relative m-2 ${className}`} 
        onMouseOver={handleMouseOver}
        ref={progressBarRef}
        data-tooltip-id="progress-tooltip"
      >
        <div className={barClassName} style={{ width: `${progress}%`, ...barStyle }} />
      </div>
      <ReactTooltip
        id="progress-tooltip"
        place="top"
        content={tooltipContent}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 1)',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: '12px'
        }}
      />
    </>
  );
};

const dimensionColors = {
  Spiritual: '🟡',
  Mental: '🟠',
  Physical: '🔴',
  Social: '🟣',
  Vocational: '🔵',
  Environmental: '🟢'
};

const dimensionOrder = ['Spiritual', 'Mental', 'Physical', 'Social', 'Vocational', 'Environmental'];

const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

const GoalCard = ({ goal, showUpdateButtons = true }) => {
  console.log("Entire goal object:", goal);
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
    return goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1);
  
  };

  const formatHabitInfo = (goal) => {
    const habit_action = goal.goal_habitData.habit_action ? `"${goal.goal_habitData.habit_action}" ` : "";
    const habit_frequencyNum = goal.goal_habitData.habit_frequencyNum || 1;
    
    let habit_frequencyPeriod;
    switch (goal.goal_habitData.habit_frequencyPeriod) {
      case 'daily':
        habit_frequencyPeriod = 'Day';
        break;
      case 'weekly':
        habit_frequencyPeriod = 'Week';
        break;
      case 'monthly':
        habit_frequencyPeriod = 'Month';
        break;
      default:
        habit_frequencyPeriod = 'Day'; // Default to 'Day' if no valid value is provided
    }
    
    if (habit_frequencyNum === 1) {
      if (habit_frequencyPeriod === 'Day') {
        return `${habit_action} Once Daily`;
      }
      return `${habit_action} Once ${habit_frequencyPeriod}ly`;
    }
    
    if (habit_frequencyNum === 2) {
      if (habit_frequencyPeriod === 'Day') {
        return `${habit_action} Twice Daily`;
      }
      return `${habit_action} Twice ${habit_frequencyPeriod}ly`;
    }
    
    return `${habit_action} ${habit_frequencyNum} Times per ${habit_frequencyPeriod}`;
  }

  const getRelevantUpdates = () => {
    const now = new Date();
    switch (goal.goal_habitData.habit_frequencyPeriod) {
      case 'daily':
        return goal.goal_habitData.habit_actionUpdates.filter(update => isToday(update.Date));
      case 'week':
        return goal.goal_habitData.habit_actionUpdates.filter(update => isThisWeek(update.Date));
      case 'month':
        return goal.goal_habitData.habit_actionUpdates.filter(update => isThisMonth(update.Date));
      default:
        return [];
    }
  };

  const determineCurrentHabitStreak = (habitData) => {
    const { habit_actionUpdates, habit_frequencyPeriod, habit_frequencyNum } = habitData;
    if (!habit_actionUpdates || habit_actionUpdates.length === 0) return 0;
  
    const sortedUpdates = [...habit_actionUpdates].sort((a, b) => new Date(b.Date) - new Date(a.Date));
    let streak = 0;
    let currentDate = new Date();
  
    const isCompleted = (updates, start, end) => {
      const periodUpdates = updates.filter(update => {
        const updateDate = new Date(update.Date);
        return updateDate >= start && updateDate < end;
      });
      return periodUpdates.length >= habit_frequencyNum;
    };
  
    while (true) {
      let periodStart, periodEnd;
  
      switch (habit_frequencyPeriod) {
        case 'daily':
          periodStart = startOfDay(currentDate);
          periodEnd = startOfDay(subDays(currentDate, 1));
          break;
        case 'weekly':
          periodStart = startOfWeek(currentDate);
          periodEnd = startOfWeek(subWeeks(currentDate, 1));
          break;
        case 'monthly':
          periodStart = startOfMonth(currentDate);
          periodEnd = startOfMonth(subMonths(currentDate, 1));
          break;
        default:
          return streak;
      }
  
      if (isCompleted(sortedUpdates, periodEnd, periodStart)) {
        streak++;
        currentDate = periodEnd;
      } else {
        break;
      }
    }
  
    return streak;
  };

  const [totalActionsPerformed, setTotalActionsPerformed] = useState(0);
  const [mostRecentAction, setMostRecentAction] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (goal.goal_type === 'habit') {
      const updates = getRelevantUpdates();
      setTotalActionsPerformed(updates.length);
      setMostRecentAction(updates.length > 0 ? updates[updates.length - 1] : null);
      setCurrentStreak(determineCurrentHabitStreak(goal.goal_habitData));
    }
  }, [goal]);

  const getCompletionColor = () => {
    if (totalActionsPerformed === 0) return 'text-red-500';
    if (totalActionsPerformed < goal.goal_habitData.habit_frequencyNum) return 'text-orange-500';
    if (totalActionsPerformed === goal.goal_habitData.habit_frequencyNum) return 'text-green-500';
    return 'text-blue-500';
  };

  const getPeriodText = () => {
    switch (goal.goal_habitData.habit_frequencyPeriod) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return '';
    }
  };

  const pluralize = (word, count) => {
    if (count === 1) {
      return word;
    }
    if (word === 'daily') {
      return 'days';
    }
    return word + 's';
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{goal.goal_name}</CardTitle>
            <div className="text-sm">{formatGoalType(goal)}</div>
            <div className="text-sm text-gray-500">
              {goal.status === "Not Yet Started" && isValidDate(goal.goal_creationDate) && (
                <p>Created: {formatDate(goal.goal_creationDate)}</p>
              )}
              {goal.status === "In Progress" && isValidDate(goal.goal_startDate) && (
                <p>Started: {formatDate(goal.goal_startDate)}</p>
              )}
              {goal.status === "Completed" && isValidDate(goal.goal_completedDate) && (
                <p>Completed: {formatDate(goal.goal_completedDate)}</p>
              )}
              <p>Last Modified: {formatDate(goal.goal_lastUpdated || goal.goal_startDate)}</p>
            </div>
            <div className={`text-sm font-semibold ${getStatusColor(goal.status)}`}>
              Status: {goal.status}
            </div>
            <div className="text-sm mt-2"> 
              {isValidDate(goal.goal_deadline) && (
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
              <span className="ml-2 font-bold">{`${formatHabitInfo(goal)}`}</span>
            </div>
            {goal.status !== 'Not Yet Started' && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <span className="mr-2 font-semibold">Total Times:</span>
                  <span>{goal.goal_habitData.habit_actionUpdates.length}</span>
                </div>
                <div>
                  <span className="mr-2 font-semibold">Times {getPeriodText()}:</span><span className={`${getCompletionColor()}`}>{totalActionsPerformed}/{goal.goal_habitData.habit_frequencyNum}</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center">
                    <span className="mr-2 font-semibold">Current Streak:</span>
                    <span>🔥{currentStreak} {pluralize(goal.goal_habitData.habit_frequencyPeriod, currentStreak)}🔥</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {goal.goal_type === 'performance' && goal.performance_valueHistory && goal.performance_valueHistory.length > 0 && (
          <div className="mt-2">
            <div className="mb-2 font-semibold">
              Target: {formatPerformanceValue(goal.performance_targetValue, goal.performance_unit, goal.performance_unitIsPrefix, false)}
            </div>
            {goal.performance_valueHistory.length > 0 && (
              <PerformanceChart data={goal.performance_valueHistory} goal={goal}/>
            )}
          </div>
        )}

        {goal.goal_type === 'project' && goal.goal_projectData && goal.goal_projectData.tasks && (
          <div className="mt-2">
            <div className="flex items-center mb-2">
              <span className="ml-2 font-bold">Project Overview</span>
            </div>
            <div className="overflow-x-auto">
              <div 
                className={`grid grid-rows-2 grid-cols-${goal.goal_projectData.tasks.lists.length} border border-gray-200 rounded-lg`} 
                // style={{ gridTemplateColumns: `repeat(${goal.goal_projectData.tasks.lists.length}, minmax(100px, 1fr))` }}
              >
                {goal.goal_projectData.tasks.lists.map((list, index) => (
                  <React.Fragment key={list.id}>
                    <div className={`text-center font-semibold p-2 border-b border-r border-gray-200 ${index === 0 ? 'rounded-tl-lg' : ''} ${index === goal.goal_projectData.tasks.lists.length - 1 ? 'rounded-tr-lg border-r-0' : ''}`}>
                      {list.title}
                    </div>
                  </React.Fragment>
                ))}
                {goal.goal_projectData.tasks.lists.map((list, index) => (
                  <React.Fragment key={list.id}>
                    <div className={`text-center p-2 border-r border-gray-200 ${index === 0 ? 'rounded-bl-lg' : ''} ${index === goal.goal_projectData.tasks.lists.length - 1 ? 'rounded-br-lg border-r-0' : ''}`}>
                      {list.cardIds.length} tasks
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
        {goal.goal_type === 'transformation' && goal.subGoals && goal.subGoals.length > 0 && (
          <div className="mt-2">
            <div className="font-bold mb-2">Transformation Breakdown:</div>
            <TransformationPieChart subGoals={goal.subGoals} />
            <div className="mt-4">
              <div className="font-bold mb-2">Overall Progress:</div>
              <div className="relative">
                <ProgressBar
                  progress={calculateProgress(goal)}
                  className="w-full h-6 bg-gray-200 rounded-full overflow-hidden"
                  barClassName="h-full bg-blue-500"
                  dataTooltipId={
                    <div className="p-2">
                      {goal.subGoals.map((subGoal, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{subGoal.goal.goal_name}</span>
                            <span className="text-sm">{subGoal.goal.percentComplete.toFixed(2)}%</span>
                          </div>
                          <ProgressBar
                            progress={subGoal.goal.percentComplete}
                            className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"
                            barClassName="h-full"
                            barStyle={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                        </div>
                      ))}
                    </div>
                  }
                />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold">
                  {calculateProgress(goal).toFixed(2)}%
                </span>
              </div>
            </div>
            {/* <div className="mt-4">
              <div className="font-bold mb-2">Sub-goals:</div>
              <div className={`grid x-overflow-auto grid-cols-${goal.subGoals.length}`}>
                {goal.subGoals.map((subGoal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex-grow">
                      <div className="font-semibold">{subGoal.goal.goal_name}</div>
                      <div className="text-sm text-gray-600">
                        {subGoal.goal.percentComplete.toFixed(2)}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        )}
        {showUpdateButtons && (
          <div className="mt-4 flex justify-around">
            <button onClick={() => console.log('Review goal:', goal.goal_name)} className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded">
              Review
            </button>
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
