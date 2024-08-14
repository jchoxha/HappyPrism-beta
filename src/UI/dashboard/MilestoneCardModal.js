import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Theme } from '../theme.js';
import GoalCard from './GoalCard'; 
const config = require('../../config.js');

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

const MilestoneCardModal = ({ milestone, onSave, onCancel, onDelete }) => {
  const [editedMilestone, setEditedMilestone] = useState({
    ...milestone,
    logEntries: milestone.logEntries || [],
    description: milestone.description || ''
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingEmoji, setIsLoadingEmoji] = useState(false);
  const [emojiError, setEmojiError] = useState('');
  const [showLogView, setShowLogView] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const theme = new Theme();
  const [svgPathSparkles, setSvgPathSparkles] = useState('/Images/UI/sparkles.svg');
  const emojiPickerRef = useRef(null);
  const isPreExistingGoal = editedMilestone.milestone_Type === "Pre-Existing Goal" || editedMilestone.pre_existing_goal != null;

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--dimension-text-color').trim();
    setSvgPathSparkles(theme.getSvgPathBasedOnTextColorAndName(textColor, 'sparkles'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMilestone(prevMilestone => ({ ...prevMilestone, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedMilestone);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setEditedMilestone({ ...milestone, logEntries: milestone.logEntries || [] });
    setHasChanges(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject) => {
    setEditedMilestone(prevMilestone => ({ ...prevMilestone, emoji: emojiObject.emoji }));
    setShowEmojiPicker(false);
    setHasChanges(true);
  };

  const suggestEmoji = async () => {
    setIsLoadingEmoji(true);
    setEmojiError('');
    setShowEmojiPicker(false);

    if (!editedMilestone.name) {
      setEmojiError('Please enter a name before suggesting an emoji.');
      setIsLoadingEmoji(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Based on the following milestone name, suggest an emoji to represent it. Do not return any text besides one suggested emoji: "${editedMilestone.name}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestedEmoji = response.text().trim();

      if (isValidEmoji(suggestedEmoji)) {
        setEditedMilestone(prevMilestone => ({ ...prevMilestone, emoji: suggestedEmoji }));
        setHasChanges(true);
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

  const isValidEmoji = (str) => {
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;
    return emojiRegex.test(str);
  };

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

  const handleViewLog = () => {
    setShowLogView(true);
  };

  const handleBackToMilestone = () => {
    setShowLogView(false);
  };

  const handleAddLogEntry = (content) => {
    const newEntry = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toISOString()
    };
    const updatedMilestone = {
      ...editedMilestone,
      logEntries: [newEntry, ...editedMilestone.logEntries]
    };
    setEditedMilestone(updatedMilestone);
    setHasChanges(true);
  };

  const handleDeleteLogEntry = (entryId) => {
    setEditedMilestone(prevMilestone => ({
      ...prevMilestone,
      logEntries: prevMilestone.logEntries.filter(entry => entry.id !== entryId)
    }));
    setHasChanges(true);
  };

  const handleEditLogEntry = (entryId, newContent) => {
    setEditedMilestone(prevMilestone => ({
      ...prevMilestone,
      logEntries: prevMilestone.logEntries.map(entry =>
        entry.id === entryId ? { ...entry, content: newContent } : entry
      )
    }));
    setHasChanges(true);
  };

  const LogView = ({ editedMilestone, onAddLogEntry, onBackToMilestone, onDeleteLogEntry, onEditLogEntry }) => {
    const [newLogEntry, setNewLogEntry] = useState('');
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editedEntryContent, setEditedEntryContent] = useState('');
  
    const handleNewLogEntryChange = (e) => {
      setNewLogEntry(e.target.value);
    };
  
    const handleSubmitLogEntry = () => {
      if (newLogEntry.trim()) {
        onAddLogEntry(newLogEntry.trim());
        setNewLogEntry('');
      }
    };

    const handleStartEditEntry = (entry) => {
      setEditingEntryId(entry.id);
      setEditedEntryContent(entry.content);
    };

    const handleSaveEditEntry = () => {
      if (editedEntryContent.trim()) {
        onEditLogEntry(editingEntryId, editedEntryContent);
        setEditingEntryId(null);
      }
    };

    const handleStatusChange = (e) => {
      const newStatus = e.target.value;
      setEditedMilestone(prevMilestone => {
        const updatedMilestone = { ...prevMilestone, status: newStatus };
        
        if (newStatus === 'In Progress' || newStatus === 'Completed') {
          updatedMilestone.startDate = updatedMilestone.startDate || new Date().toISOString().slice(0, 16);
        } else {
          updatedMilestone.startDate = null;
        }
    
        if (newStatus === 'Completed') {
          updatedMilestone.completedDate = updatedMilestone.completedDate || new Date().toISOString().slice(0, 16);
          updatedMilestone.deadline = null;
          updatedMilestone.hasDeadline = false;
        } else {
          updatedMilestone.completedDate = null;
        }
    
        return updatedMilestone;
      });
      setHasChanges(true);
    };
  
    return (
      <>
        <div className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-2xl font-bold mb-4">
            {editedMilestone.emoji} {editedMilestone.name} Log
          </h2>
          <div className="mb-4">
            <textarea
              value={newLogEntry}
              onChange={handleNewLogEntryChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              placeholder="Enter your log entry..."
            />
            <button
              onClick={handleSubmitLogEntry}
              className="mt-2 dimension-theme-colored px-4 py-2 rounded"
            >
              Submit Log Entry
            </button>
          </div>
          <div>
            {editedMilestone.logEntries.map(entry => (
              <div key={entry.id} className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">{new Date(entry.timestamp).toLocaleString()}</p>
                {editingEntryId === entry.id ? (
                  <textarea
                    value={editedEntryContent}
                    onChange={(e) => setEditedEntryContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    rows="3"
                  />
                ) : (
                  <p>{entry.content}</p>
                )}
                <div className="mt-2 flex justify-end space-x-2">
                  {editingEntryId === entry.id ? (
                    <button
                      onClick={handleSaveEditEntry}
                      className="dimension-theme-colored px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEditEntry(entry)}
                      className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
                    >
                      Edit Log Entry
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteLogEntry(entry.id)}
                    className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
                  >
                    Delete Log Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-100 rounded-b-lg">
          <button onClick={onBackToMilestone} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">Return to Milestone</button>
        </div>
      </>
    );
  };

  const renderMilestoneContent = () => {
    if (isPreExistingGoal) {
      return (
        <div className="p-6 overflow-y-auto flex-grow flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Pre-Existing Goal Milestone</h2>
          <GoalCard goal={editedMilestone.pre_existing_goal} showUpdateButton={false} />
          <button 
            onClick={() => onDelete(editedMilestone)} 
            className="mt-4 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
          >
            Remove Milestone
          </button>
        </div>
      );
    }

    return (
      <div className="p-6 overflow-y-auto flex-grow">
        <h2 className="text-2xl font-bold mb-4">Edit Milestone</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedMilestone.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="emoji" className="block mb-1">Emoji:</label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="dimension-theme-colored ai-suggest-emoji w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 mr-2"
                  onClick={suggestEmoji}
                  disabled={isLoadingEmoji || !editedMilestone.name}
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
                  onClick={toggleEmojiPicker}
                  className="emoji-button ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                >
                  {editedMilestone.emoji || 'Select an Emoji'}
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
              </div>
              {emojiError && <p className="text-red-500 text-sm mt-1">{emojiError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block mb-1">Status:</label>
              <select
                id="status"
                name="status"
                value={editedMilestone.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Not Yet Started">Not Yet Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            {(editedMilestone.status === 'In Progress' || editedMilestone.status === 'Completed') && (
              <div className="mb-4">
                <label htmlFor="startDate" className="block mb-1">Start Date:</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={editedMilestone.startDate || new Date().toISOString().slice(0, 16)}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
            {editedMilestone.status === 'Completed' && (
              <div className="mb-4">
                <label htmlFor="completedDate" className="block mb-1">Completion Date:</label>
                <input
                  type="datetime-local"
                  id="completedDate"
                  name="completedDate"
                  value={editedMilestone.completedDate || new Date().toISOString().slice(0, 16)}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
            {editedMilestone.status !== 'Completed' && (
              <>
              <div className="mb-4">
                <div className="flex items-center">
                  <Switch
                    checked={editedMilestone.hasDeadline}
                    onChange={() => setEditedMilestone(prev => ({ ...prev, hasDeadline: !prev.hasDeadline }))}
                    color="primary"
                  />
                  <label htmlFor="hasDeadline" className="ml-2">Milestone has a Deadline</label>
                </div>
              </div>
              {editedMilestone.hasDeadline && (
                <div className="mb-4">
                  <label htmlFor="deadline" className="block mb-1">Deadline:</label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    name="deadline"
                    value={editedMilestone.deadline || new Date().toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              )}
              </>
            )}
            <div className="mb-4">
              <label htmlFor="description" className="block mb-1">Description:</label>
              <textarea
                id="description"
                name="description"
                value={editedMilestone.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              />
            </div>
            <button
              type="button"
              onClick={handleViewLog}
              className="w-full dimension-theme-colored px-4 py-2 mt-4"
            >
              View Milestone Log
            </button>
          </form>
        <button 
          onClick={() => onDelete(editedMilestone)} 
          className="w-full mt-2 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
        >
          Delete Milestone
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" style={{ margin: "0" }}>
      <div className="bg-white rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()} style={{
        maxHeight: '-webkit-fill-available',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showLogView ? (
          <LogView
            editedMilestone={editedMilestone}
            onAddLogEntry={handleAddLogEntry}
            onBackToMilestone={handleBackToMilestone}
            onDeleteLogEntry={handleDeleteLogEntry}
            onEditLogEntry={handleEditLogEntry}
          />
        ) : (
          <>
            {renderMilestoneContent()}
            <div className="p-4 bg-gray-100 rounded-b-lg">
              {isPreExistingGoal ? (
                <div className="flex justify-center mb-2">
                  <button onClick={onCancel} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">Close</button>
                </div>
              ) : hasChanges ? (
                <div className="flex justify-between mb-2">
                  <button onClick={handleSubmit} className="dimension-theme-colored text-white px-4 py-2 rounded">Save Changes</button>
                  <button onClick={handleDiscard} className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center">Discard Changes</button>
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <button onClick={onCancel} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">Close</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MilestoneCardModal;