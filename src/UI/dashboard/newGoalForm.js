import React, { useState, useEffect, useRef } from 'react';
import { Goal, Milestone, ProjectTask, SubGoal } from './goal.js';
import { Switch } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import GoalPicker from './GoalPicker.js';
import GoalCard from './GoalCard.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useDimension } from '../DimensionContext.js';
import { getRandomExample } from './goalExamples.js';
import { Theme } from '../theme.js';
import KanbanBoard from './KanbanBoard';
const config = require('../../config.js');

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

const goalDescriptions = {
  challenge: {
    title: "Challenge",
    description: "A specific objective broken down into milestones that act as precursor steps.",
    example: "Example: Complete a marathon with milestones for training milestones."
  },
  habit: {
    title: "Habit",
    description: "A recurring action with a frequency and streak to be maintained.",
    example: "Example: Exercise 5 times weekly for 30 days."
  },
  performance: {
    title: "Performance",
    description: "An objective to improve performance over time, possibly with a specific target.",
    example: "Example: Increase bench press weight to 200 lbs by the end of the year."
  },
  project: {
    title: "Project",
    description: "A goal with specific steps organized into 'To Do', 'In Progress', and 'Done'.",
    example: "Example: Launch a personal website with tasks for design, setup, and content creation."
  },
  transformation: {
    title: "Transformation",
    description: "A long-term goal focused on positive change, often with linked sub-goals.",
    example: "Example: Become physically fit with sub-goals for various fitness challenges and habits."
  }
};

const NewGoalForm = ({ onSubmit, onCancel, existingGoals }) => {
  const { currentDimension, getDimensionsForNewGoal } = useDimension();
  const [option, setOption] = useState(null);
  const [goalType, setGoalType] = useState('');
  const [goalData, setGoalData] = useState({
    goal_name: '',
    goal_emoji: null,
    goal_type: '',
    goal_startDate: new Date().toISOString().slice(0, 16),
    goal_deadline: null,
    milestones: [],
    project_tasks: [],
    subGoals: [] // Add subGoals
  });
  const [isLoadingEmoji, setIsLoadingEmoji] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [hasMilestones, setHasMilestones] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectLists, setProjectLists] = useState({
    lists: [
      { id: 'list-1', title: 'To Do', cardIds: [], statusOfTasks: 'Not Yet Started' },
      { id: 'list-2', title: 'In Progress', cardIds: [], statusOfTasks: 'In Progress' },
      { id: 'list-3', title: 'Done', cardIds: [], statusOfTasks: 'Completed' },
    ],
    cards: {}
  });  
  const [subGoals, setSubGoals] = useState([]); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
  const lastSuggestedNames = useRef({});
  const [emojiError, setEmojiError] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [habitData, setHabitData] = useState({
    habit_action: '',
    habit_frequencyNum: 1,
    habit_frequencyPeriod: 'daily',
    habit_goal_streakNum: 1,
    habit_streakPeriod: 'days'
  });
  const [habitErrors, setHabitErrors] = useState({
    habit_frequencyNum: '',
    habit_goal_streakNum: ''
  });
  const [performanceData, setPerformanceData] = useState({
    performance_metric: '',
    performance_unit: '',
    performance_startingValue: '',
    performance_targetValue: ''
  });
  const [goalNameExample, setGoalNameExample] = useState('');
  const theme = new Theme();
  const [svgPathSparkles, setSvgPathSparkles] = useState('/Images/UI/sparkles.svg');
  const [goalStatus, setGoalStatus] = useState("Not Yet Started");
  const emojiPickerRef = useRef(null);
  const [projectGoal, setProjectGoal] = useState(null);
  const [availableStatuses, setAvailableStatuses] = useState(["Not Yet Started", "In Progress", "Completed"]);
  const [dimensions, setDimensions] = useState(getDimensionsForNewGoal());

  useEffect(() => {
    setDimensions(getDimensionsForNewGoal());
  }, [currentDimension]);

  const handleDimensionChange = (dimension) => {
    setDimensions(prevDimensions => ({
      ...prevDimensions,
      [dimension]: !prevDimensions[dimension]
    }));
  };

  useEffect(() => {
    if (goalType === 'challenge' || goalType === 'project' || goalType === 'transformation') {
      updateAvailableStatuses();
    }
  }, [milestones, projectLists, subGoals, goalType]);

  useEffect(() => {
    if (goalType === 'project') {
      setProjectGoal(new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        'project',
        goalData.goal_startDate,
        goalData.goal_deadline,
        [],
        {},
        {},
        { tasks: [], percentComplete: 0, taskPercentagesEnabled: false }
      ));
    }
  }, [goalType]);

  const handleKanbanBoardUpdate = (updatedBoardData) => {
    setProjectLists(updatedBoardData);
    updateAvailableStatuses();
  };

  const updateAvailableStatuses = () => {
    let hasActiveOrCompletedItems = false;
  
    if (goalType === 'project') {
      // Check for in-progress or completed tasks, including pre-existing goals
      hasActiveOrCompletedItems = Object.values(projectLists.cards).some(card => 
        card.status === "In Progress" || 
        card.status === "Completed" ||
        (card.taskType === "Pre-Existing Goal" && 
         (card.pre_existing_goal.status === "In Progress" || card.pre_existing_goal.status === "Completed"))
      );
    } else if (goalType === 'challenge') {
      // Check for in-progress or completed milestones, including pre-existing goals
      hasActiveOrCompletedItems = milestones.some(milestone => 
        milestone.started || 
        milestone.completed ||
        (milestone.pre_existing_goal && 
         (milestone.pre_existing_goal.status === "In Progress" || milestone.pre_existing_goal.status === "Completed"))
      );
    } else if (goalType === 'transformation') {
      // Check for in-progress or completed sub-goals
      hasActiveOrCompletedItems = subGoals.some(subGoal => 
        subGoal.goal.status === "In Progress" || subGoal.goal.status === "Completed"
      );
    }
  
    if (hasActiveOrCompletedItems) {
      setAvailableStatuses(["In Progress", "Completed"]);
      if (goalStatus === "Not Yet Started") {
        setGoalStatus("In Progress");
      }
    } else {
      setAvailableStatuses(["Not Yet Started", "In Progress", "Completed"]);
    }
  };

  const handleGoalStatusChange = (newStatus) => {
    setGoalStatus(newStatus);
    if (projectGoal) {
      projectGoal.updateStatus(newStatus);
    }
  };

  useEffect(() => {
    theme.updateThemeForNode({ dimensionName: currentDimension });
  }, [currentDimension]);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--dimension-text-color').trim();
    setSvgPathSparkles(theme.getSvgPathBasedOnTextColorAndName(textColor, 'sparkles'));
  }, [currentDimension, theme]);

  useEffect(() => {
    if (goalType) {
      setGoalNameExample(getRandomExample(goalType, currentDimension));
    }
  }, [goalType, currentDimension]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoalData(prevData => ({ ...prevData, [name]: value }));
    setIsDirty(true);
  };

  const handleGoalTypeChange = (e) => {
    const newType = e.target.value;
    setGoalType(newType);
    setGoalData(prevData => ({ ...prevData, goal_type: newType }));
    setIsDirty(false);
  };

  const handleHabitInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    
    if (name === 'habit_frequencyNum' || name === 'habit_goal_streakNum') {
      updatedValue = Math.max(1, parseInt(value) || 0);
      
      setHabitErrors(prevErrors => ({
        ...prevErrors,
        [name]: updatedValue < 1 ? 'Minimum value is 1' : ''
      }));
    }
    
    setHabitData(prevData => {
      const newData = { ...prevData, [name]: updatedValue };
      
      if (name === 'habit_frequencyPeriod') {
        if (value === 'weekly' && newData.habit_streakPeriod === 'days') {
          newData.habit_streakPeriod = 'weeks';
        } else if (value === 'monthly' && (newData.habit_streakPeriod === 'days' || newData.habit_streakPeriod === 'weeks')) {
          newData.habit_streakPeriod = 'months';
        }
      }
      
      return newData;
    });
    setIsDirty(true);
  };

  const getFrequencyPeriodText = (period) => {
    const { habit_frequencyNum } = habitData;
    const isPlural = habit_frequencyNum !== 1;
    
    switch (period) {
      case 'daily':
        return isPlural ? 'times per day' : 'time per day';
      case 'weekly':
        return isPlural ? 'times per week' : 'time per week';
      case 'monthly':
        return isPlural ? 'times per month' : 'time per month';
      default:
        return '';
    }
  };

  const getStreakPeriodText = (period) => {
    const { habit_goal_streakNum } = habitData;
    const isPlural = habit_goal_streakNum !== 1;
    
    switch (period) {
      case 'days':
        return isPlural ? 'days' : 'day';
      case 'weeks':
        return isPlural ? 'weeks' : 'week';
      case 'months':
        return isPlural ? 'months' : 'month';
      default:
        return '';
    }
  };

  const getValidStreakPeriods = () => {
    switch (habitData.habit_frequencyPeriod) {
      case 'daily':
        return ['days', 'weeks', 'months'];
      case 'weekly':
        return ['weeks', 'months'];
      case 'monthly':
        return ['months'];
      default:
        return ['days', 'weeks', 'months'];
    }
  };

  const handlePerformanceInputChange = (e) => {
    const { name, value } = e.target;
    setPerformanceData(prevData => ({ ...prevData, [name]: value }));
    setIsDirty(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Check for sub-goals if the goal type is transformation
    if (goalType === 'transformation' && subGoals.length === 0) {
        setFormError('Transformation goals must have at least one sub-goal.');
        setShowFormErrorModal(true);
        return;
    }

    // Check for tasks if the goal type is project
    if (goalType === 'project' && projectTasks.length === 0) {
        setFormError('Project goals must have at least one task.');
        setShowFormErrorModal(true);
        return;
    }

    let newGoal;
    if (goalType === 'habit') {
      newGoal = new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        goalData.goal_type,
        goalData.goal_startDate,
        null,
        [],
        habitData,
        {},
        {},
        [],
        { subGoals: [], totalPercentComplete: 0 },
        dimensions
      );
    } else if (goalType === 'project') {
      const allTasks = projectLists.lists.flatMap(list => list.cardIds.map(id => projectLists.cards[id]));
      if (allTasks.length === 0) {
        setFormError('Project goals must have at least one task.');
        setShowFormErrorModal(true);
        return;
      }
      projectGoal.project_tasks = allTasks.map(task => new ProjectTask(
        task.content,
        task.emoji,
        task.status,
        task.taskType,
        task.pre_existing_goal,
        task.deadline,
        task.description
      ));
      newGoal = projectGoal;
      newGoal.dimensions = dimensions;
    } else if (goalType === 'transformation') {
      newGoal = new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        goalData.goal_type,
        goalData.goal_startDate,
        goalData.goal_deadline,
        [],
        {},
        {},
        {},
        { subGoals: subGoals.map(sg => ({ ...sg, goal: { ...sg.goal, status: sg.goal.status } })), totalPercentComplete: 0 },
        dimensions
      );
    } else {
      newGoal = new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        goalData.goal_type,
        goalData.goal_startDate,
        goalData.goal_deadline,
        goalData.milestones.map(m => new Milestone(m.name, m.emoji, m.started, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal)),
        {},
        {},
        {},
        [],
        { subGoals: [], totalPercentComplete: 0 },
        dimensions
      );
    }

    newGoal.status = goalStatus; 
    console.log(newGoal);
    onSubmit(newGoal);
    clearForm();
  };




  const handleOptionClick = (selectedOption) => {
    setOption(selectedOption);
  };

  const handleBackClick = () => {
    if ((option === 'ai' && goalData.ai_description) || (option === 'manual' && isDirty)) {
      setShowModal(true);
      setModalAction('back');
    } else {
      confirmBack();
    }
  };

  const confirmBack = () => {
    setShowModal(false);
    setOption(null);
    setGoalType('');
    clearForm();
  };

  const cancelBack = () => {
    setShowModal(false);
  };

  const handleToggleChange = (setter, value) => {
    if (!value) {
      setter(true);
      if (setter === setHasMilestones) {
        setMilestones([]);
      }
    } else {
      setter(false);
      if (setter === setHasMilestones) {
        setMilestones([]);
      }
    }
  };

  const confirmToggle = () => {
    if (modalAction) {
      modalAction();
    }
    setShowModal(false);
  };

  const cancelToggle = () => {
    setShowModal(false);
  };

  const clearForm = () => {
    setGoalData({
      goal_name: '',
      goal_emoji: null,
      goal_type: '',
      goal_startDate: new Date(),
      goal_deadline: null,
      milestones: [],
      project_tasks: [] 
    });
    setHabitData({
      habit_action: '',
      habit_frequencyNum: 1,
      habit_frequencyPeriod: 'daily',
      habit_goal_streakNum: 1,
      habit_streakPeriod: 'days'
    });
    setIsDirty(false);
    setHasDeadline(false);
    setHasMilestones(false);
    setMilestones([]);
    setProjectTasks([]); 
    setProjectLists([
      { id: 1, title: "To-Do", tasks: [] },
      { id: 2, title: "In Progress", tasks: [] },
      { id: 3, title: "Completed", tasks: [] }
    ]);
  };

  const toggleEmojiPicker = (index) => {
    if (activeEmojiPicker === index && showEmojiPicker) {
      setShowEmojiPicker(false);
    } else {
      setActiveEmojiPicker(index);
      setShowEmojiPicker(true);
    }
  };

  useEffect(() => {
    if (option === 'manual' && goalType) {
      setIsDirty(false);
    }
  }, [goalType]);

  const handleMilestoneChange = (index, key, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [key]: value };
    setMilestones(updatedMilestones);
    setIsDirty(true);
  };

  const handleAddNewMilestone = () => {
    setMilestones([...milestones, { name: '', hasDeadline: false, deadline: '' }]);
    updateAvailableStatuses();
  };

  const handleGoalPickerSelect = (selectedGoal) => {
    if (goalType === 'challenge') {
      const newMilestone = {
        name: selectedGoal.goal_name,
        emoji: selectedGoal.goal_emoji,
        started: false,
        startDate: selectedGoal.goal_startDate,
        deadline: selectedGoal.goal_deadline,
        completed: false,
        completedDate: null,
        pre_existing_goal: selectedGoal
      };
      setMilestones([...milestones, newMilestone]);
    } else if (goalType === 'project') {
      const newCardId = `task-${Date.now()}`;
      const newCard = {
        id: newCardId,
        content: selectedGoal.goal_name,
        emoji: selectedGoal.goal_emoji,
        status: selectedGoal.status,
        taskType: 'Pre-Existing Goal',
        pre_existing_goal: selectedGoal,
        deadline: selectedGoal.goal_deadline,
        description: selectedGoal.goal_description || ""
      };
      setProjectLists(prevData => ({
        ...prevData,
        lists: prevData.lists.map(list => 
          list.title === 'To Do' 
            ? { ...list, cardIds: [...list.cardIds, newCardId] }
            : list
        ),
        cards: {
          ...prevData.cards,
          [newCardId]: newCard
        }
      }));
    } else if (goalType === 'transformation') {
      const newSubGoal = {
        goal: new Goal(
          selectedGoal.goal_name,
          selectedGoal.goal_emoji,
          selectedGoal.goal_type,
          selectedGoal.goal_startDate,
          selectedGoal.goal_deadline,
          selectedGoal.goal_milestones,
          selectedGoal.goal_habitData,
          selectedGoal.goal_performanceData,
          selectedGoal.goal_projectData,
          selectedGoal.goal_subGoals,
          selectedGoal.goal_transformationData
        ),
        percentOfTransformation: 100
      };
      newSubGoal.goal.status = selectedGoal.status;
      const updatedSubGoals = distributeTransformationPercentages([...subGoals, newSubGoal]);
      setSubGoals(updatedSubGoals);
    }
    updateAvailableStatuses();
    setShowGoalPicker(false);
  };
  

  const handleGoalPickerCancel = () => {
    setShowGoalPicker(false);
  };

  const handleRemoveMilestone = (index) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
    updateAvailableStatuses();
  };

  const handleMoveMilestoneUp = (index) => {
    if (index === 0) return;
    const updatedMilestones = [...milestones];
    [updatedMilestones[index - 1], updatedMilestones[index]] = [updatedMilestones[index], updatedMilestones[index - 1]];
    setMilestones(updatedMilestones);
  };

  const handleMoveMilestoneDown = (index) => {
    if (index === milestones.length - 1) return;
    const updatedMilestones = [...milestones];
    [updatedMilestones[index + 1], updatedMilestones[index]] = [updatedMilestones[index], updatedMilestones[index + 1]];
    setMilestones(updatedMilestones);
  };

  useEffect(() => {
    setGoalData(prevData => ({
      ...prevData,
      milestones: milestones
    }));
  }, [milestones]);


  useEffect(() => {
    setGoalData(prevData => ({
      ...prevData,
      project_tasks: projectTasks
    }));
  }, [projectTasks]);

  const ErrorPopup = ({ message, onClose }) => (
    <div className="error-popup">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );

  const isValidEmoji = (str) => {
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;
    return emojiRegex.test(str);
  };

  const suggestEmoji = async (index) => {
    setIsLoadingEmoji(true);
    setEmojiError('');
    setActiveEmojiPicker(index);
    setShowEmojiPicker(false);

    const isGoalEmoji = index === 'goal';
    const isMilestoneEmoji = milestones.some((_, idx) => idx === index);
    const emojiName = isGoalEmoji ? goalData.goal_name : isMilestoneEmoji ? milestones[index]?.name : projectTasks[index]?.name;
    const emojiType = isGoalEmoji ? goalType : isMilestoneEmoji ? 'Milestone' : 'Task';

    if (!emojiName) {
      setEmojiError('Please enter a name before suggesting an emoji.');
      setIsLoadingEmoji(false);
      setActiveEmojiPicker(null);
      return;
    }

    if (lastSuggestedNames.current[index] === emojiName) {
      setIsLoadingEmoji(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Based on the following name for a ${emojiType}, suggest an emoji to represent it. Do not return any text besides one suggested emoji: "${emojiName}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestedEmoji = response.text().trim();

      if (isValidEmoji(suggestedEmoji)) {
        if (isGoalEmoji) {
          setGoalData(prevData => ({ ...prevData, goal_emoji: suggestedEmoji }));
        } else if (isMilestoneEmoji) {
          const updatedMilestones = [...milestones];
          updatedMilestones[index].emoji = suggestedEmoji;
          setMilestones(updatedMilestones);
        } else {
          const updatedTasks = [...projectTasks];
          updatedTasks[index].emoji = suggestedEmoji;
          setProjectTasks(updatedTasks);
        }
        lastSuggestedNames.current[index] = emojiName;
      } else {
        throw new Error('Invalid emoji response');
      }
    } catch (error) {
      console.error("Error suggesting emoji:", error);
      setEmojiError('Something went wrong. Please try again, possibly with a different name.');
    } finally {
      setIsLoadingEmoji(false);
    }
  };

  useEffect(() => {
    if (goalData.goal_name !== lastSuggestedNames.current['goal']) {
      lastSuggestedNames.current['goal'] = null;
    }
  }, [goalData.goal_name]);

  useEffect(() => {
    milestones.forEach((milestone, index) => {
      if (milestone.name !== lastSuggestedNames.current[index]) {
        lastSuggestedNames.current[index] = null;
      }
    });
  }, [milestones]);

  useEffect(() => {
    projectTasks.forEach((task, index) => {
      if (task.name !== lastSuggestedNames.current[index]) {
        lastSuggestedNames.current[index] = null;
      }
    });
  }, [projectTasks]);

  const renderEmojiPicker = (index, type) => {
    const isGoalEmoji = type === 'goal';
    const isMilestoneEmoji = type === 'milestone';
    const emojiName = isGoalEmoji ? goalData.goal_name : isMilestoneEmoji ? milestones[index]?.name : projectTasks[index]?.name;
    const currentEmoji = isGoalEmoji ? goalData.goal_emoji : isMilestoneEmoji ? milestones[index]?.emoji : projectTasks[index]?.emoji;

    return (
      <div className="emoji-picker-container">
        <button
          type="button"
          className="dimension-theme-colored ai-suggest-emoji w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
          onClick={() => suggestEmoji(index)}
          disabled={isLoadingEmoji || !emojiName}
          aria-label="Have AI suggest an Emoji"
        >
          {isLoadingEmoji ? (
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
          ) : (
            <img src={svgPathSparkles} alt="Have AI suggest an Emoji" className="w-5 h-5" />
          )}
        </button>
        <button
          type="button"
          className="emoji-button ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
          onClick={() => toggleEmojiPicker(index)}
          style={{ fontSize: currentEmoji ? '1.5em' : '1em' }}
        >
          {currentEmoji || 'Select an Emoji'}
        </button>
        {activeEmojiPicker === index && showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute z-10">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              suggestedEmojisMode="recent"
              emojiStyle="native" 
            />
          </div>
        )}
        {emojiError && <p className="text-red-500 text-sm mt-1">{emojiError}</p>}
      </div>
    );
  };

  const handleEmojiClick = (emojiObject, index, type) => {
    const emoji = emojiObject.emoji;
    if (type === 'goal') {
      setGoalData(prevData => ({ ...prevData, goal_emoji: emoji }));
    } else if (type === 'milestone') {
      const updatedMilestones = [...milestones];
      updatedMilestones[index].emoji = emoji;
      setMilestones(updatedMilestones);
    } else if (type === 'task') {
      const updatedTasks = [...projectTasks];
      updatedTasks[index].emoji = emoji;
      setProjectTasks(updatedTasks);
    }
    setShowEmojiPicker(false);
  };

  const renderMaxPercentageMessage = (maxValue, totalLocked) => (
    <small className="description-example">
      Max value: {maxValue}%
    </small>
  );




const handleRemoveSubGoal = (index) => {
  const updatedSubGoals = subGoals.filter((_, i) => i !== index);
  setSubGoals(updatedSubGoals);
  updateAvailableStatuses();
};

const handleMoveSubGoalUp = (index) => {
  if (index === 0) return;
  const updatedSubGoals = [...subGoals];
  [updatedSubGoals[index - 1], updatedSubGoals[index]] = [updatedSubGoals[index], updatedSubGoals[index - 1]];
  setSubGoals(updatedSubGoals);
};

const handleMoveSubGoalDown = (index) => {
  if (index === subGoals.length - 1) return;
  const updatedSubGoals = [...subGoals];
  [updatedSubGoals[index + 1], updatedSubGoals[index]] = [updatedSubGoals[index], updatedSubGoals[index + 1]];
  setSubGoals(updatedSubGoals);
};

const renderSubGoal = (subGoal, index) => {
  const getMaxAllowedPercentage = (subGoals) => {
    const updatedSubGoals = [...subGoals];
    const unlockedSubGoals = updatedSubGoals.filter((subGoal, idx) => !subGoal.lockedPercent);
    const totalLockedPercentage = subGoals
      .filter(subGoal => subGoal.lockedPercent)
      .reduce((total, subGoal) => total + subGoal.percentOfTransformation, 0);
    return 100 - totalLockedPercentage - unlockedSubGoals.length + 1;
  };

  const maxAllowedPercentage = getMaxAllowedPercentage(subGoals);
  const unlockedSubGoals = subGoals.filter(sg => !sg.lockedPercent);
  const minAllowedPercentage = unlockedSubGoals.length === 1 ? maxAllowedPercentage : 1;
  const totalLockedPercentage = 100 - maxAllowedPercentage;

  const handleSubGoalChange = (index, key, value) => {
    const updatedSubGoals = [...subGoals];
    updatedSubGoals[index] = { ...updatedSubGoals[index], [key]: value };

    if (key === 'percentOfTransformation') {
      const lockedPercentage = updatedSubGoals.filter(sg => sg.lockedPercent).reduce((sum, sg) => sum + sg.percentOfTransformation, 0);
      const remainingPercentage = 100 - lockedPercentage - value;
      const unlockedSubGoals = updatedSubGoals.filter((sg, idx) => !sg.lockedPercent && idx !== index);

      if (remainingPercentage >= 0) {
        const distributedPercentage = unlockedSubGoals.length > 0 ? remainingPercentage / unlockedSubGoals.length : 0;
        updatedSubGoals.forEach((sg, idx) => {
          if (!sg.lockedPercent && idx !== index) {
            sg.percentOfTransformation = Math.round(distributedPercentage);
          }
        });
      }
    }
    setSubGoals(updatedSubGoals);
  };

  return (
    <div key={index} className="sub-goal">
      <div className="sub-goal-header">
        <span className="title">#{index + 1}</span>
        <div className="rearrange-buttons">
          <button type="button" onClick={() => handleRemoveSubGoal(index)} className="remove-button">
            <img src="/Images/UI/trashcan.svg" alt="Remove" />
          </button>
          {index > 0 && (
            <button type="button" onClick={() => handleMoveSubGoalUp(index)} className="rearrange-button">
              <img src="/Images/UI/up_small.svg" alt="Move Up" />
            </button>
          )}
          {index < subGoals.length - 1 && (
            <button type="button" onClick={() => handleMoveSubGoalDown(index)} className="rearrange-button">
              <img src="/Images/UI/down_small.svg" alt="Move Down" />
            </button>
          )}
        </div>
      </div>
      <GoalCard goal={subGoal.goal} showUpdateButton={false} />
      <div className="form-group">
        <label htmlFor={`subGoal_${index}_percentOfTransformation`}>Percent of Transformation:</label>
        <small className='description-example'>How much of the total transformation does this Sub-Goal represent?</small>
        <div className="slider-container">
          <span>{Number(subGoal.percentOfTransformation.toFixed(2))}%</span>
          {!subGoal.lockedPercent && (
            <>
              <input
                type="range"
                id={`subGoal_${index}_percentOfTransformation`}
                name={`subGoal_${index}_percentOfTransformation`}
                value={minAllowedPercentage === maxAllowedPercentage ? 100 : subGoal.percentOfTransformation}
                onChange={minAllowedPercentage === maxAllowedPercentage ? null : (e) => handleSubGoalChange(index, 'percentOfTransformation', parseInt(e.target.value))}
                min={minAllowedPercentage === maxAllowedPercentage ? 1 : minAllowedPercentage}
                max={minAllowedPercentage === maxAllowedPercentage ? 100 : maxAllowedPercentage}
                style={{ width: '100%' }} // Ensure slider looks full when at max
              />
            </>
          )}
          {subGoal.lockedPercent && (
            <>
              <input
                type="range"
                id={`subGoal_${index}_percentOfTransformation`}
                name={`subGoal_${index}_percentOfTransformation`}
                value={subGoal.percentOfTransformation}
                onChange={(e) => handleSubGoalChange(index, 'percentOfTransformation', parseInt(e.target.value))}
                min="1"
                max={100}
                disabled={true}
                style={{ width: '100%' }} // Ensure slider looks full when at max
              />
            </>
          )}
          {!subGoal.lockedPercent && totalLockedPercentage > 0 && minAllowedPercentage != maxAllowedPercentage && (
            renderMaxPercentageMessage(maxAllowedPercentage, totalLockedPercentage)
          )}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor={`subGoal_${index}_lockPercent`}>Lock Percentage</label>
        <Switch
          checked={subGoal.lockedPercent}
          onChange={() => handleSubGoalChange(index, 'lockedPercent', !subGoal.lockedPercent)}
          color="primary"
          id={`subGoal_${index}_lockPercent`}
        />
      </div>
    </div>
  );
};


const [allSubGoalsLocked, setAllSubGoalsLocked] = useState(false);

useEffect(() => {
  const getMaxAllowedPercentage = (subGoals) => {
    const updatedSubGoals = [...subGoals];
    const unlockedSubGoals = updatedSubGoals.filter((subGoal, idx) => !subGoal.lockedPercent);
    const totalLockedPercentage = subGoals
      .filter(subGoal => subGoal.lockedPercent)
      .reduce((total, subGoal) => total + subGoal.percentOfProject, 0);
    return 100 - totalLockedPercentage - unlockedSubGoals.length + 1;
  };

  if(subGoals.length > 0) {
    const updatedSubGoals = [...subGoals];
    const unlockedSubGoals = updatedSubGoals.filter((subGoal, idx) => !subGoal.lockedPercent);
    setAllSubGoalsLocked(
      subGoals.every(subGoal => subGoal.lockedPercent) || 
      (unlockedSubGoals.length == 1 && getMaxAllowedPercentage(subGoals) <= 1)
    );
  } else{
    setAllSubGoalsLocked(false);
  }
}, [projectTasks]);

const distributeTransformationPercentages = (subGoals) => {
  const totalLockedPercentage = subGoals
    .filter(subGoal => subGoal.lockedPercent)
    .reduce((total, subGoal) => total + subGoal.percentOfTransformation, 0);
  
  const unlockedSubGoals = subGoals.filter(subGoal => !subGoal.lockedPercent);
  const totalUnlockedSubGoals = unlockedSubGoals.length;
  
  const newPercentage = totalUnlockedSubGoals > 0 ? (100 - totalLockedPercentage) / totalUnlockedSubGoals : 0;

  return subGoals.map(subGoal => subGoal.lockedPercent ? subGoal : { ...subGoal, percentOfTransformation: newPercentage });
};

const [goalPickerList, setGoalPickerList] = useState([]);

const getAlreadyAddedGoalIds = () => {
  if (goalType === 'challenge') {
    console.log(milestones);
    return milestones.map(m => m.pre_existing_goal?.id).filter(id => id);
  } else if (goalType === 'project') {
    return projectTasks.map(t => t.pre_existing_goal?.id).filter(id => id);
  } else if (goalType === 'transformation') {
    return subGoals.map(sg => sg.goal.id).filter(id => id);
  }
  return [];
};

const handleAddPreExistingGoalAsMilestone = () => {
  const alreadyAddedGoalIds = getAlreadyAddedGoalIds();
  const availableGoals = existingGoals.filter(goal => !alreadyAddedGoalIds.includes(goal.id));
  setGoalPickerList(availableGoals);
  setShowGoalPicker(true);
};

const handleAddPreExistingGoalAsProjectTask = () => {
  const alreadyAddedGoalIds = getAlreadyAddedGoalIds();
  const availableGoals = existingGoals.filter(goal => !alreadyAddedGoalIds.includes(goal.id));
  setGoalPickerList(availableGoals);
  setShowGoalPicker(true);
};

const handleAddSubGoal = () => {
  const alreadyAddedGoalIds = getAlreadyAddedGoalIds();
  const availableGoals = existingGoals.filter(goal => !alreadyAddedGoalIds.includes(goal.id));
  setGoalPickerList(availableGoals);
  setShowGoalPicker(true);
};

const [formError, setFormError] = useState('');

const [showFormErrorModal, setShowFormErrorModal] = useState(false);

const ErrorModal = ({ message, onClose }) => (
  <div className="modal">
      <div className="modal-content">
          <p>{message}</p>
          <button onClick={onClose} className="dimension-theme-colored confirm-button">Close</button>
      </div>
  </div>
);

const handleAddNewProjectTask = (listId) => {
  const newCardId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const list = projectLists.lists.find(l => l.id === listId);
  const newCard = {
    id: newCardId,
    content: 'New Task',
    emoji: '📌',
    status: list.statusOfTasks,
    taskType: 'New Task',
    deadline: null,
    description: '',
  };
  setProjectLists(prevData => {
    const updatedData = {
      ...prevData,
      lists: prevData.lists.map(list => 
        list.id === listId
          ? { ...list, cardIds: [...list.cardIds, newCardId] }
          : list
      ),
      cards: {
        ...prevData.cards,
        [newCardId]: newCard
      }
    };
    updateAvailableStatuses();
    return updatedData;
  });
};

const handleProjectTaskChange = (updatedCard) => {
  setProjectLists(prevData => {
    const updatedData = {
      ...prevData,
      cards: {
        ...prevData.cards,
        [updatedCard.id]: updatedCard
      }
    };
    updateAvailableStatuses();
    return updatedData;
  });
};

const handleRemoveTask = (taskId) => {
  setProjectLists(prevData => {
    const { [taskId]: removedCard, ...remainingCards } = prevData.cards;
    const updatedData = {
      lists: prevData.lists.map(list => ({
        ...list,
        cardIds: list.cardIds.filter(id => id !== taskId)
      })),
      cards: remainingCards
    };
    updateAvailableStatuses();
    return updatedData;
  });
};

const handleListUpdate = (updatedLists) => {
  setProjectLists(prevData => ({
    ...prevData,
    lists: updatedLists
  }));
};

const renderProjectGoal = () => (
  <div onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
      <KanbanBoard
        data={projectLists}
        onBoardUpdate={handleKanbanBoardUpdate}
        existingGoals={existingGoals}
        onProjectStatusUpdate={handleGoalStatusChange}
      />
  </div>
);

useEffect(() => {
  if (!projectLists.lists) {
    setProjectLists({
      lists: [
        { id: 'list-1', title: 'To Do', cardIds: [], statusOfTasks: 'Not Yet Started' },
        { id: 'list-2', title: 'In Progress', cardIds: [], statusOfTasks: 'In Progress' },
        { id: 'list-3', title: 'Done', cardIds: [], statusOfTasks: 'Completed' },
      ],
      cards: {}
    });
  }
}, [projectLists]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showEmojiPicker]);

return (
  <div className="form-container" onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
      {showErrorPopup && (
          <ErrorPopup 
              message="Milestone deadline cannot be changed here. To modify, you must edit the source goal's deadline."
              onClose={() => setShowErrorPopup(false)}
          />
      )}
      {showFormErrorModal && (
          <ErrorModal 
              message={formError}
              onClose={() => setShowFormErrorModal(false)}
          />
      )}
      {showModal && (
          <div className="modal">
              <div className="modal-content">
                  <p><span className="bold-text">Are you sure you want to {modalAction === 'back' ? 'go back' : 'untoggle this option'}?</span><br />Any changes you have made will be lost.</p>
                  <div className="modal-buttons">
                      <button className="dimension-theme-colored confirm-button" onClick={modalAction === 'back' ? confirmBack : confirmToggle}>Yes</button>
                      <button className="dimension-theme-colored cancel-button" onClick={modalAction === 'back' ? cancelBack : cancelToggle}>No</button>
                  </div>
              </div>
          </div>
      )}
      {showGoalPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <GoalPicker
                  goals={goalPickerList}
                  onSelect={handleGoalPickerSelect}
                  onCancel={handleGoalPickerCancel}
              />
          </div>
      )}
      <div className="form-header">
          <div className="form-title">
              {!option && 'Choose Goal Setting Method'}
              {option === 'ai' && 'AI Generated Goal'}
              {option === 'manual' && 'Manual Goal Setting'}
          </div>
          <button className={option ? 'dimension-theme-colored back-button' : 'dimension-theme-colored cancel-button'} onClick={option ? handleBackClick : onCancel}>
              {option ? 'Back' : 'Cancel'}
          </button>
      </div>
      {!option && (
          <div>
              <div className="option-buttons">
                  <button
                      className="option-button dimension-theme-colored"
                      onClick={() => handleOptionClick('ai')}
                  >
                      AI Generated
                  </button>
                  <button
                      className="option-button dimension-theme-colored"
                      onClick={() => handleOptionClick('manual')}
                  >
                      Manual
                  </button>
              </div>
              <p>
                  <strong>AI Generated:</strong> Describe your goal, and HappyPrism will generate the options that best fit your description.
              </p>
              <p>
                  <strong>Manual:</strong> Manually input the goal type and its details.
              </p>
          </div>
      )}
      {option === 'ai' && (
          <div>
              <div className="sub-header">
                  Describe the goal you are trying to set, and HappyPrism will set the options that seem to best fit your description.
              </div>
              <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                      <label htmlFor="ai_description">
                          Description:
                      </label>
                      <textarea
                          id="ai_description"
                          name="ai_description"
                          rows="4"
                          className="form-control"
                          value={goalData.ai_description || ''}
                          onChange={handleInputChange}
                          required
                      />
                  </div>
                  <div className="form-group">
                      <button type="submit" className="submit-button dimension-theme-colored">Submit</button>
                  </div>
              </form>
          </div>
      )}
      {option === 'manual' && (
          <div>
              <div className="sub-header">
                  Manually input the goal type and its details.
              </div>
              <form onSubmit={handleFormSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                  <div className="form-group">
                      <label htmlFor="goal_type">Goal Type:</label>
                      <select
                          id="goal_type"
                          name="goal_type"
                          value={goalType}
                          onChange={handleGoalTypeChange}
                          required
                      >
                          <option value="">Select a goal type</option>
                          <option value="challenge">Challenge</option>
                          <option value="habit">Habit</option>
                          <option value="performance">Performance</option>
                          <option value="project">Project</option>
                          <option value="transformation">Transformation</option>
                      </select>
                  </div>

                  {goalType && (
                      <div className="description">
                          <div className="description-title">
                              {goalDescriptions[goalType].title}
                          </div>
                          <div className="description-text">
                              {goalDescriptions[goalType].description}
                          </div>
                          <div className="description-example">
                              {goalDescriptions[goalType].example}
                          </div>
                      </div>
                  )}

                  {goalType && (
                      <>
                          <div className="form-group">
                              <label htmlFor="goal_name">Goal Name:</label>
                              <input
                                  type="text"
                                  id="goal_name"
                                  name="goal_name"
                                  value={goalData.goal_name}
                                  onChange={handleInputChange}
                                  required
                              />
                              <small className='description-example'>Example: "{goalNameExample}"</small>
                          </div>
                          <div className="form-group">
                          <label>Associated Dimensions:</label>
                          <div className="dimensions-checkboxes">
                            {Object.entries(dimensions).map(([dimension, isChecked]) => (
                              <div key={dimension} className="dimension-checkbox">
                                <input
                                  type="checkbox"
                                  id={`dimension-${dimension}`}
                                  checked={isChecked}
                                  onChange={() => handleDimensionChange(dimension)}
                                />
                                <label htmlFor={`dimension-${dimension}`}>{dimension}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                          <div className="form-group">
                              <label htmlFor="goal_emoji">Goal Emoji:</label>
                              {renderEmojiPicker('goal', 'goal')}
                          </div>
                          <div className="form-group">
                            <label htmlFor="goal_status">Goal Status:</label>
                            <select
                              id="goal_status"
                              name="goal_status"
                              value={goalStatus}
                              onChange={(e) => handleGoalStatusChange(e.target.value)}
                              required
                            >
                              {availableStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                              <label htmlFor="goal_startDate">Start Date:</label>
                              <input
                                  type="datetime-local"
                                  id="goal_startDate"
                                  name="goal_startDate"
                                  value={goalData.goal_startDate}
                                  onChange={handleInputChange}
                                  required
                              />
                          </div>
                          {goalType !== 'habit' && (
                              <div className="toggle-switch">
                                  <Switch
                                      checked={hasDeadline}
                                      onChange={() => handleToggleChange(setHasDeadline, hasDeadline)}
                                      color="primary"
                                  />
                                  <label htmlFor="hasDeadline">Goal has a Deadline</label>
                              </div>
                          )}
                          {hasDeadline && goalType !== 'habit' && (
                              <div className="form-group">
                                  <label htmlFor="goal_deadline">Deadline Date & Time:</label>
                                  <input
                                      type="datetime-local"
                                      id="goal_deadline"
                                      name="goal_deadline"
                                      value={goalData.goal_deadline}
                                      onChange={handleInputChange}
                                  />
                              </div>
                          )}
                          {goalType === 'challenge' && (
                              <>
                                  <div className="toggle-switch">
                                      <Switch
                                          checked={hasMilestones}
                                          onChange={() => handleToggleChange(setHasMilestones, hasMilestones)}
                                          color="primary"
                                      />
                                      <label htmlFor="hasMilestones">Goal has Milestones</label>
                                  </div>
                                  {hasMilestones && (
                                      <div className="milestones-container">
                                          <div className="form-group add-milestone-buttons-div flex flex justify-evenly">
                                              <button 
                                                  type="button" 
                                                  className="dimension-theme-colored mt-4 font-bold py-2 px-2 rounded"
                                                  onClick={handleAddNewMilestone}
                                              >
                                                  Add New Milestone
                                              </button>
                                              <button 
                                                  type="button" 
                                                  className="dimension-theme-colored mt-4 font-bold py-2 px-2 rounded"
                                                  onClick={handleAddPreExistingGoalAsMilestone}
                                              >
                                                  Add Pre-Existing Goal<br />As Milestone
                                              </button>
                                          </div>
                                          {milestones.map((milestone, index) => (
                                              <div key={index} className="milestone">
                                                  <div className="milestone-header">
                                                      <span className="title">#{index + 1}</span>
                                                      <div className="rearrange-buttons">
                                                          <button type="button" onClick={() => handleRemoveMilestone(index)} className="remove-button">
                                                              <img src="/Images/UI/trashcan.svg" alt="Remove" />
                                                          </button>
                                                          {index > 0 && (
                                                              <button type="button" onClick={() => handleMoveMilestoneUp(index)} className="rearrange-button">
                                                                  <img src="/Images/UI/up_small.svg" alt="Move Up" />
                                                              </button>
                                                          )}
                                                          {index < milestones.length - 1 && (
                                                              <button type="button" onClick={() => handleMoveMilestoneDown(index)} className="rearrange-button">
                                                                  <img src="/Images/UI/down_small.svg" alt="Move Down" />
                                                              </button>
                                                          )}
                                                      </div>
                                                  </div>
                                                  {milestone.isPreExisting ? (
                                                      <GoalCard goal={milestone} showUpdateButton={false} />
                                                  ) : (
                                                      <>
                                                          <div className="form-group">
                                                              <label htmlFor={`milestone_${index}_name`}>Milestone Name:</label>
                                                              <input
                                                                  type="text"
                                                                  id={`milestone_${index}_name`}
                                                                  name={`milestone_${index}_name`}
                                                                  value={milestone.name}
                                                                  onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                                                              />
                                                          </div>
                                                          <div className="form-group">
                                                              <label htmlFor={`milestone_${index}_emoji`}>Milestone Emoji:</label>
                                                              {renderEmojiPicker(index, 'milestone')}
                                                          </div>
                                                          <div className="toggle-switch">
                                                              <Switch
                                                                  checked={milestone.hasDeadline}
                                                                  onChange={() => handleMilestoneChange(index, 'hasDeadline', !milestone.hasDeadline)}
                                                                  color="primary"
                                                              />
                                                              <label htmlFor={`milestone_${index}_hasDeadline`}>Has Deadline</label>
                                                          </div>
                                                          {milestone.hasDeadline && (
                                                              <div className="form-group">
                                                                  <label htmlFor={`milestone_${index}_deadline`}>Deadline Date & Time:</label>
                                                                  <input
                                                                      type="datetime-local"
                                                                      id={`milestone_${index}_deadline`}
                                                                      name={`milestone_${index}_deadline`}
                                                                      value={milestone.deadline}
                                                                      onChange={(e) => handleMilestoneChange(index, 'deadline', e.target.value)}
                                                                  />
                                                              </div>
                                                          )}
                                                      </>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </>
                          )}
                          {goalType === 'habit' && (
                              <>
                                  <div className="form-group">
                                      <label htmlFor="habit_action">Habit Action:</label>
                                      <small>What action, activity or behavior does your habit consist of?</small>
                                      <input
                                          type="text"
                                          id="habit_action"
                                          name="habit_action"
                                          value={habitData.habit_action}
                                          onChange={handleHabitInputChange}
                                          required
                                      />
                                      <small className='description-example'>Example: "Exercise" or "Read"</small>
                                  </div>
                                  
                                  <div className="form-group">
                                      <label htmlFor="habit_frequencyNum">Frequency:</label>
                                      <small>How often do you want to try to do your habit?</small>
                                      <div className="frequency-input">
                                          <input
                                              type="number"
                                              id="habit_frequencyNum"
                                              name="habit_frequencyNum"
                                              value={habitData.habit_frequencyNum}
                                              onChange={handleHabitInputChange}
                                              min="1"
                                              required
                                          />
                                          <select
                                              id="habit_frequencyPeriod"
                                              name="habit_frequencyPeriod"
                                              value={habitData.habit_frequencyPeriod}
                                              onChange={handleHabitInputChange}
                                              required
                                          >
                                              <option value="daily">{getFrequencyPeriodText('daily')}</option>
                                              <option value="weekly">{getFrequencyPeriodText('weekly')}</option>
                                              <option value="monthly">{getFrequencyPeriodText('monthly')}</option>
                                          </select>
                                      </div>
                                      {habitErrors.habit_frequencyNum && (
                                          <small className="error">{habitErrors.habit_frequencyNum}</small>
                                      )}
                                      <small className='description-example'>Example: "3 times per week" or "1 time per day"</small>
                                  </div>
                                  
                                  <div className="form-group">
                                      <label htmlFor="habit_goal_streakNum">Streak Goal:</label>
                                      <small>How many days/weeks/months in a row do you want to try to keep your habit going?</small>
                                      <div className="streak-input">
                                          <input
                                              type="number"
                                              id="habit_goal_streakNum"
                                              name="habit_goal_streakNum"
                                              value={habitData.habit_goal_streakNum}
                                              onChange={handleHabitInputChange}
                                              min="1"
                                              required
                                          />
                                          <select
                                              id="habit_streakPeriod"
                                              name="habit_streakPeriod"
                                              value={habitData.habit_streakPeriod}
                                              onChange={handleHabitInputChange}
                                              required
                                          >
                                              {getValidStreakPeriods().map(period => (
                                                  <option key={period} value={period}>{getStreakPeriodText(period)}</option>
                                              ))}
                                          </select>
                                      </div>
                                      {habitErrors.habit_goal_streakNum && (
                                          <small className="error">{habitErrors.habit_goal_streakNum}</small>
                                      )}
                                      <small className='description-example'>Example: "For 30 days in a row" or "For 1 week straight"</small>
                                  </div>
                              </>
                          )}
                          {goalType === 'performance' && (
                              <>
                                  <div className="form-group">
                                      <label htmlFor="performance_metric">Performance Metric:</label>
                                      <input
                                          type="text"
                                          id="performance_metric"
                                          name="performance_metric"
                                          value={performanceData.performance_metric}
                                          onChange={handlePerformanceInputChange}
                                          required
                                      />
                                      <small className='description-example'>Example: "Bench Press Weight" or "Running Speed"</small>
                                  </div>
                                  <div className="form-group">
                                      <label htmlFor="performance_unit">Unit of Measurement:</label>
                                      <input
                                          type="text"
                                          id="performance_unit"
                                          name="performance_unit"
                                          value={performanceData.performance_unit}
                                          onChange={handlePerformanceInputChange}
                                          required
                                      />
                                      <small className='description-example'>Example: "lbs" or "mph"</small>
                                  </div>
                                  <div className="form-group">
                                      <label htmlFor="performance_startingValue">Starting Value:</label>
                                      <input
                                          type="number"
                                          id="performance_startingValue"
                                          name="performance_startingValue"
                                          value={performanceData.performance_startingValue}
                                          onChange={handlePerformanceInputChange}
                                          required
                                      />
                                      <small className='description-example'>Example: "100" (for 100 lbs) or "6" (for 6 mph)</small>
                                  </div>
                                  <div className="form-group">
                                      <label htmlFor="performance_targetValue">Target Value:</label>
                                      <input
                                          type="number"
                                          id="performance_targetValue"
                                          name="performance_targetValue"
                                          value={performanceData.performance_targetValue}
                                          onChange={handlePerformanceInputChange}
                                          required
                                      />
                                      <small className='description-example'>Example: "200" (for 200 lbs) or "8" (for 8 mph)</small>
                                  </div>
                              </>
                          )}
                          {goalType === 'project' && (
                            renderProjectGoal()
                          )}
                          {goalType === 'transformation' && (
                              <div className="sub-goals-container flex justify-center flex-col">
                                  <button 
                                      type="button" 
                                      className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded"
                                      onClick={handleAddSubGoal}
                                      disabled={allSubGoalsLocked} 
                                  >
                                      Add Sub-Goal
                                  </button>
                                  {subGoals.map((subGoal, index) => renderSubGoal(subGoal, index))}
                              </div>
                          )}
                          <div className="form-group">
                              <div className="form-divider"></div>
                              <button type="submit" className="submit-button dimension-theme-colored">Review Goal</button>
                          </div>
                      </>
                  )}
              </form>
          </div>
      )}
  </div>
);

};

export default NewGoalForm;
