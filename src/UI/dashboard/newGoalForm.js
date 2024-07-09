import React, { useState, useEffect } from 'react';
import { Goal, Milestone } from './goal.js';
import { Switch } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import GoalPicker from './GoalPicker.js';
import GoalCard from './GoalCard.js'; // Importing GoalCard

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
  const [option, setOption] = useState(null);
  const [goalType, setGoalType] = useState('');
  const [goalData, setGoalData] = useState({
    goal_name: '',
    goal_emoji: null,
    goal_type: '',
    goal_startDate: new Date(),
    goal_deadline: null,
    milestones: []
  });
  const [showModal, setShowModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [hasMilestones, setHasMilestones] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newGoal = new Goal(
      goalData.goal_name,
      goalData.goal_emoji,
      goalData.goal_type,
      goalData.goal_startDate,
      goalData.goal_deadline,
      goalData.milestones.map(m => new Milestone(m.name, m.emoji, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal))
    );
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
      goal_emoji: nullS,
      goal_type: '',
      goal_startDate: new Date(),
      goal_deadline: null,
      milestones: []
    });
    setIsDirty(false);
    setHasDeadline(false);
    setHasMilestones(false);
    setMilestones([]);
  };

  const handleEmojiClick = (emojiObject) => {
    if (activeEmojiPicker === 'goal') {
      setGoalData({ ...goalData, goal_emoji: emojiObject.emoji });
    } else if (typeof activeEmojiPicker === 'number') {
      const updatedMilestones = [...milestones];
      updatedMilestones[activeEmojiPicker].emoji = emojiObject.emoji;
      setMilestones(updatedMilestones);
    }
    setActiveEmojiPicker(null);
  };

  const toggleEmojiPicker = (index) => {
    if (activeEmojiPicker === index) {
      setActiveEmojiPicker(null);
    } else {
      setActiveEmojiPicker(index);
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
  };

  const handleAddPreExistingGoalAsMilestone = () => {
    setShowGoalPicker(true);
  };

  const handleGoalPickerSelect = (selectedGoal) => {
    const newMilestone = {
      ...selectedGoal,
      isPreExisting: true
    };
    setMilestones([...milestones, newMilestone]);
    setShowGoalPicker(false);
  };

  const handleGoalPickerCancel = () => {
    setShowGoalPicker(false);
  };

  const handleRemoveMilestone = (index) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
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

  const ErrorPopup = ({ message, onClose }) => (
    <div className="error-popup">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );

  return (
    <div className="form-container">
      {showErrorPopup && (
        <ErrorPopup 
          message="Milestone deadline cannot be changed here. To modify, you must edit the source goal's deadline."
          onClose={() => setShowErrorPopup(false)}
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
            goals={existingGoals}
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
          <form onSubmit={handleFormSubmit}>
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
                  <small>Example: "Complete a Marathon"</small>
                </div>
                <div className="form-group">
                  <label htmlFor="goal_emoji">Goal Emoji:</label>
                  <button
                    type="button"
                    className="emoji-button"
                    onClick={() => toggleEmojiPicker('goal')}
                    style={{ fontSize: goalData.goal_emoji ? '2em' : 'inherit' }}
                  >
                    {goalData.goal_emoji || 'Select an Emoji to represent your Goal'}
                  </button>
                  {activeEmojiPicker === 'goal' && (
                    <EmojiPicker 
                      onEmojiClick={handleEmojiClick}
                      suggestedEmojisMode="recent"
                      emojiStyle="native"
                    />
                  )}
                </div>
                <div className="toggle-switch">
                  <Switch
                    checked={hasDeadline}
                    onChange={() => handleToggleChange(setHasDeadline, hasDeadline)}
                    color="primary"
                  />
                  <label htmlFor="hasDeadline">Goal has a Deadline</label>
                </div>
                {hasDeadline && (
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
                        <div className="form-group add-milestone-buttons-div">
                          <button 
                            type="button" 
                            className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded"
                            onClick={handleAddNewMilestone}
                          >
                            Add New Milestone
                          </button>
                          <button 
                            type="button" 
                            className="dimension-theme-colored mt-4 font-bold py-2 px-4 rounded"
                            onClick={handleAddPreExistingGoalAsMilestone}
                          >
                            Add Pre-Existing Goal As Milestone
                          </button>
                        </div>
                        {milestones.map((milestone, index) => (
                          <div key={index} className="milestone">
                            <div className="milestone-header">
                              <span className="title">#{index + 1}</span>
                              <div className="rearrange-buttons">
                                <button type="button" onClick={() => handleRemoveMilestone(index)} className="remove-button">
                                  <img src="/public/Images/UI/trashcan.svg" alt="Remove" />
                                </button>
                                {index > 0 && (
                                  <button type="button" onClick={() => handleMoveMilestoneUp(index)} className="rearrange-button">
                                    <img src="/public/Images/UI/up_small.svg" alt="Move Up" />
                                  </button>
                                )}
                                {index < milestones.length - 1 && (
                                  <button type="button" onClick={() => handleMoveMilestoneDown(index)} className="rearrange-button">
                                    <img src="/public/Images/UI/down_small.svg" alt="Move Down" />
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
                                  <button
                                    type="button"
                                    className="emoji-button"
                                    onClick={() => toggleEmojiPicker(index)}
                                    style={{ fontSize: milestone.emoji ? '2em' : 'inherit' }}
                                  >
                                    {milestone.emoji || 'Select an Emoji to represent your Milestone'}
                                  </button>
                                  {activeEmojiPicker === index && (
                                    <EmojiPicker 
                                      onEmojiClick={handleEmojiClick}
                                      suggestedEmojisMode="recent"
                                      emojiStyle="native"
                                    />
                                  )}
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
