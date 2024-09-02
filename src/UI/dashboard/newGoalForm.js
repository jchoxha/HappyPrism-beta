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
import JourneyMap from './JourneyMap';
import HabitScheduler from './HabbitScheduler.js';
import { v4 as uuidv4 } from 'uuid';
const config = require('../../config.js');

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

const goalTypes = [
  { value: 'challenge', label: 'Challenge', emoji: '🏆' },
  { value: 'habit', label: 'Habit', emoji: '📅' },
  { value: 'performance', label: 'Performance', emoji: '📊' },
  { value: 'project', label: 'Project', emoji: '🛠️' },
  { value: 'transformation', label: 'Transformation', emoji: '🔄' },
];

const goalDescriptions = {
  challenge: {
    title: "Challenge 🏆",
    description: "A specific objective broken down into milestones that act as precursor steps.",
    example: "Example: Complete a marathon with milestones for training milestones."
  },
  habit: {
    title: "Habit 📅",
    description: "A recurring action with a frequency and streak to be maintained.",
    example: "Example: Exercise 5 times weekly for 30 days."
  },
  performance: {
    title: "Performance 📊",
    description: "An objective to improve performance over time, possibly with a specific target.",
    example: "Example: Increase bench press weight to 200 lbs by the end of the year."
  },
  project: {
    title: "Project 🛠️",
    description: "A goal with specific steps organized into 'To Do', 'In Progress', and 'Done'.",
    example: "Example: Launch a personal website with tasks for design, setup, and content creation."
  },
  transformation: {
    title: "Transformation 🔄",
    description: "A long-term goal focused on positive change, consisting of a set of sub-goals that each make up a certain percentage of the overall transformation.",
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
    goal_startDate: null,
    goal_deadline: null,
    goal_completedDate: null,
    milestones: [],
    project_tasks: [],
    subGoals: []
  });
  const [isLoadingEmoji, setIsLoadingEmoji] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
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
  const [lastSuggestedName, setLastSuggestedName] =  useState(null);
  const [emojiError, setEmojiError] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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
  const [habitData, setHabitData] = useState({
    habit_action: '',
    habit_frequencyNum: 1,
    habit_frequencyPeriod: 'daily',
    habit_goal_streakNum: 1,
    habit_streakPeriod: 'days',
    scheduleActions: []
  });

  const handleHabitDataChange = (newHabitData) => {
    setHabitData(newHabitData);
    setIsDirty(true);
  };

  const [habitErrors, setHabitErrors] = useState({
    habit_frequencyNum: '',
    habit_goal_streakNum: ''
  });

  const [streakGoalEnabled, setStreakGoalEnabled] = useState(false);

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
      return newData;
    });
  };
  const [selectedDimensions, setSelectedDimensions] = useState({});

  const dimensions = [
    { name: 'Spiritual', emoji: '✨', color: 'bg-yellow-300', description: 'Explore your inner self and connect with your beliefs and values.' },
    { name: 'Mental', emoji: '🧠', color: 'orange-bg', description: 'Enhance your cognitive abilities and emotional wellbeing.' },
    { name: 'Physical', emoji: '💪', color: 'bg-red-500', description: "Improve your body's health and fitness through exercise and nutrition." },
    { name: 'Social', emoji: '👥', color: 'bg-purple-500', description: 'Build and maintain meaningful relationships with others.' },
    { name: 'Vocational', emoji: '💼', color: 'bg-blue-500', description: 'Develop your career and find purpose in your work.' },
    { name: 'Environmental', emoji: '🌍', color: 'bg-green-500', description: 'Create harmony with your surroundings and the planet.' },
  ];
  const dimensionColors = {
    Spiritual: '🟡',
    Mental: '🟠',
    Physical: '🔴',
    Social: '🟣',
    Vocational: '🔵',
    Environmental: '🟢'
  };

  const dimensionOrder = ['Spiritual', 'Mental', 'Physical', 'Social', 'Vocational', 'Environmental'];

  const handleDimensionToggle = (e, dimensionName) => {
    e.preventDefault(); 
    e.stopPropagation();
    setSelectedDimensions(prevDimensions => ({
      ...prevDimensions,
      [dimensionName]: !prevDimensions[dimensionName]
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

  const handleJourneyMapUpdate = (updatedMapData) => {
    setMilestones(updatedMapData.map(milestone => ({
      ...milestone,
      status: milestone.status || 'Not Yet Started',
      startDate: milestone.startDate || null,
      completedDate: milestone.completedDate || null,
      hasDeadline: milestone.hasDeadline || false,
      deadline: milestone.deadline || null
    })));
    updateAvailableStatuses();
  }
 
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
      hasActiveOrCompletedItems = milestones.some(milestone => 
        milestone.status === "In Progress" || 
        milestone.status === "Completed" ||
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

  useEffect(() => {
    if (goalStatus === 'In Progress' || goalStatus === 'Completed') {
      setGoalData(prevData => ({
        ...prevData,
        goal_startDate: prevData.goal_startDate || new Date().toISOString().slice(0, 16)
      }));
    } else {
      setGoalData(prevData => ({
        ...prevData,
        goal_startDate: null
      }));
    }

    if (goalStatus === 'Completed') {
      setGoalData(prevData => ({
        ...prevData,
        goal_completedDate: prevData.goal_completedDate || new Date().toISOString().slice(0, 16),
        goal_deadline: null
      }));
      setHasDeadline(false);
    } else {
      setGoalData(prevData => ({
        ...prevData,
        goal_completedDate: null
      }));
    }
  }, [goalStatus]);

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
        dimensions,
        goalData.description // Add description here
      );
    } else if (goalType === 'challenge') {
      newGoal = new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        goalData.goal_type,
        goalData.goal_startDate,
        goalData.goal_deadline,
        milestones.map(m => new Milestone(
          m.name, 
          m.emoji, 
          m.status, 
          m.startDate, 
          m.deadline, 
          m.completedDate, 
          m.pre_existing_goal, 
          m.description, 
          m.id
        )),
        {},
        {},
        {},
        [],
        { subGoals: [], totalPercentComplete: 0 },
        dimensions,
        goalData.description // Add description here
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
      newGoal.description = goalData.description; // Add description here
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
        dimensions,
        goalData.description // Add description here
      );
    } else {
      newGoal = new Goal(
        goalData.goal_name,
        goalData.goal_emoji,
        goalData.goal_type,
        goalData.goal_startDate,
        goalData.goal_deadline,
        goalData.milestones.map(m => new Milestone(m.name, m.emoji, m.status, m.startDate, m.deadline, m.completedDate, m.pre_existing_goal, m.description, m.id)),
        {},
        {},
        {},
        [],
        { subGoals: [], totalPercentComplete: 0 },
        dimensions,
        goalData.description // Add description here
      );
    }
  
    newGoal.status = goalStatus; 
    newGoal.goal_completedDate = goalData.goal_completedDate; // Add completed date here
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
    } else {
      setter(false);
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
    setMilestones([]);
    setProjectTasks([]); 
    setProjectLists([
      { id: 1, title: "To-Do", tasks: [] },
      { id: 2, title: "In Progress", tasks: [] },
      { id: 3, title: "Completed", tasks: [] }
    ]);
  };

  const toggleEmojiPicker = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    } else {
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
    
    // If the status is changing, update the dates accordingly
    if (key === 'status') {
      if (value === 'In Progress' && !updatedMilestones[index].startDate) {
        updatedMilestones[index].startDate = new Date().toISOString().slice(0, 16);
      } else if (value === 'Completed') {
        if (!updatedMilestones[index].startDate) {
          updatedMilestones[index].startDate = new Date().toISOString().slice(0, 16);
        }
        updatedMilestones[index].completedDate = new Date().toISOString().slice(0, 16);
      } else if (value === 'Not Yet Started') {
        updatedMilestones[index].startDate = null;
        updatedMilestones[index].completedDate = null;
      }
    }

    setMilestones(sortMilestones(updatedMilestones));
    setIsDirty(true);
  };

  const sortMilestones = (milestonesToSort) => {
    return milestonesToSort.sort((a, b) => {
      const statusOrder = { 'Completed': 0, 'In Progress': 1, 'Not Yet Started': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const handleGoalPickerSelect = (selectedGoal) => {
    if (goalType === 'challenge') {
      const newMilestone = new Milestone(
        selectedGoal.goal_name,
        selectedGoal.goal_emoji,
        selectedGoal.status,
        selectedGoal.goal_startDate,
        selectedGoal.goal_deadline,
        selectedGoal.completedDate,
        selectedGoal,
        selectedGoal.description
      );
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

  const suggestEmoji = async () => {
    setIsLoadingEmoji(true);
    setEmojiError('');
    setShowEmojiPicker(false);

    const emojiName = goalData.goal_name;
    const emojiType = goalType;

    if (!emojiName) {
      setEmojiError('Please enter a goal name before suggesting an emoji.');
      setIsLoadingEmoji(false);
      return;
    }

    if (lastSuggestedName === emojiName) {
      setIsLoadingEmoji(false);
      setEmojiError('Please enter a new goal name before suggesting an emoji.');
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Based on the following name for a ${emojiType} goal, suggest an emoji to represent it. Do not return any text besides one suggested emoji: "${emojiName}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestedEmoji = response.text().trim();

      if (isValidEmoji(suggestedEmoji)) {
        setGoalData(prevData => ({ ...prevData, goal_emoji: suggestedEmoji }));
        setLastSuggestedName(emojiName);
      } else {
        throw new Error('Invalid emoji response, try again.');
      }
    } catch (error) {
      console.error("Error suggesting emoji:", error);
      setEmojiError('Something went wrong. Please try again, possibly with a different name.');
    } finally {
      setIsLoadingEmoji(false);
    }
  };

  useEffect(() => {
    if (goalData.goal_name !== lastSuggestedName) {
      setLastSuggestedName(null);
    }
  }, [goalData.goal_name]);

  const renderEmojiPicker = () => {
    const emojiName = goalData.goal_name;
    const currentEmoji = goalData.goal_emoji;

    return (
      <div className="emoji-picker-container">
        <button
          type="button"
          className="dimension-theme-colored ai-suggest-emoji w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
          onClick={() => suggestEmoji()}
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
          onClick={() => toggleEmojiPicker()}
          style={{ fontSize: currentEmoji ? '1.5em' : '1em' }}
        >
          {currentEmoji || 'Select an Emoji'}
        </button>
        {showEmojiPicker && (
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

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setGoalData(prevData => ({ ...prevData, goal_emoji: emoji }));
    console.log(goalData);
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

  const [streakGoalEnabled, setStreakGoalEnabled] = useState(false);

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
      return newData;
    });
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" style={{ margin: "0" }}>
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
                          <option value="challenge">Challenge 🏆</option>
                          <option value="habit">Habit 📅</option>
                          <option value="performance">Performance 📊</option>
                          <option value="project">Project 🛠️</option>
                          <option value="transformation">Transformation 🔄</option>
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
                            <label htmlFor="description" className="block mb-1">Goal Description:</label>
                            <textarea
                              id="description"
                              name="description"
                              value={goalData.description}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows="3"
                            />
                          </div>
                          <div className="form-group">
                            <label>Associated Dimensions:</label>
                            <div className="flex items-center mb-2">
                            {dimensionOrder.map(dimension => 
                              selectedDimensions[dimension] && (
                                <span key={dimension} title={dimension} className="mr-1">
                                  {dimensionColors[dimension]}
                                </span>
                              )
                            )}
                            </div>
                            <p className="text-sm text-gray-500 italic text-center mb-4">Click a dimension to toggle it on/off for this goal.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                              {dimensions.map((dimension) => (
                                <button
                                  key={dimension.name}
                                  onClick={(e) => handleDimensionToggle(e, dimension.name)}
                                  className={`${dimension.color} rounded-lg p-4 text-center transition-all duration-300 ${
                                    selectedDimensions[dimension.name]
                                      ? 'scale-105 shadow-lg'
                                      : 'scale-100 opacity-70'
                                  }`}
                                >
                                  <p className="font-medium">{dimension.name} <span className='shadow-text'>{dimension.emoji}</span></p>
                                </button>
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
                          
                          {(goalStatus === 'In Progress' || goalStatus === 'Completed') && (
                            <div className="form-group">
                              <label htmlFor="goal_startDate">Start Date:</label>
                              <input
                                type="datetime-local"
                                id="goal_startDate"
                                name="goal_startDate"
                                value={goalData.goal_startDate || new Date().toISOString().slice(0, 16)}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          )}
                          
                          {goalStatus === 'Completed' && (
                            <div className="form-group">
                              <label htmlFor="goal_completedDate">Completion Date:</label>
                              <input
                                type="datetime-local"
                                id="goal_completedDate"
                                name="goal_completedDate"
                                value={goalData.goal_completedDate || new Date().toISOString().slice(0, 16)}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          )}
                          
                          {goalStatus !== 'Completed' && goalType !== 'habit' && (
                            <div className="toggle-switch">
                              <Switch
                                checked={hasDeadline}
                                onChange={() => handleToggleChange(setHasDeadline, hasDeadline)}
                                color="primary"
                              />
                              <label htmlFor="hasDeadline">Goal has a Deadline</label>
                            </div>
                          )}
                          
                          {hasDeadline && goalStatus !== 'Completed' && goalType !== 'habit' && (
                            <div className="form-group">
                              <label htmlFor="goal_deadline">Deadline Date & Time:</label>
                              <input
                                type="datetime-local"
                                id="goal_deadline"
                                name="goal_deadline"
                                value={goalData.goal_deadline || new Date().toISOString().slice(0, 16)}
                                onChange={handleInputChange}
                              />
                            </div>
                          )}
                          {goalType === 'challenge' && (
                              <>
                                <div className="challenge-goal-section">
                                <JourneyMap
                                  data={milestones}
                                  onMapUpdate={handleJourneyMapUpdate}
                                  goalName={goalData.goal_name}
                                  existingGoals={existingGoals}
                                />
                                </div>
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
                              {habitData.habit_frequencyPeriod === 'daily' && (
                                <HabitScheduler
                                  habitData={habitData}
                                  onHabitDataChange={handleHabitDataChange}
                                />
                              )}
                              </div>
                              <div className="form-group flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => setStreakGoalEnabled(!streakGoalEnabled)}
                                  className={`dimension-theme-colored py-2 px-4 rounded`}
                                >
                                  {streakGoalEnabled ? 'Disable Streak Goal for this Habbit' : 'Set a Streak Goal for this Habbit'}
                                </button>
                              </div>

                              {streakGoalEnabled && (
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
                              )}
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
                              <button type="submit" className="submit-button dimension-theme-colored">Create New Goal</button>
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
