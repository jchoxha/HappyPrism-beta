import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Switch } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Theme } from '../theme.js';
import dotenv from 'dotenv';
const config = require('../../config.js');

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

// Placeholder data (modified to include more details)
const defaultData = {
  lists: [
    { id: 'list-1', title: 'To Do', cardIds: ['task-1', 'task-2', 'task-3'], statusOfTasks: 'Not Yet Started' },
    { id: 'list-2', title: 'In Progress', cardIds: ['task-4', 'task-5'], statusOfTasks: 'In Progress' },
    { id: 'list-3', title: 'Done', cardIds: ['task-6'], statusOfTasks: 'Completed' },
  ],
  cards: {
    'task-1': { id: 'task-1', content: 'Take out the garbage', emoji: '🗑️', status: 'To Do', taskType: 'New Task', deadline: null, description: '' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show', emoji: '📺', status: 'To Do', taskType: 'New Task', deadline: null, description: '' },
    'task-3': { id: 'task-3', content: 'Charge my phone', emoji: '📱', status: 'To Do', taskType: 'New Task', deadline: null, description: '' },
    'task-4': { id: 'task-4', content: 'Cook dinner', emoji: '🍳', status: 'In Progress', taskType: 'New Task', deadline: null, description: '' },
    'task-5': { id: 'task-5', content: 'Fix the sink', emoji: '🔧', status: 'In Progress', taskType: 'New Task', deadline: null, description: '' },
    'task-6': { id: 'task-6', content: 'Walk the dog', emoji: '🐕', status: 'Done', taskType: 'New Task', deadline: null, description: '' },
  },
};




const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  const [editedCard, setEditedCard] = useState({
    ...card,
    hasDeadline: !!card.deadline,
    logEntries: card.logEntries || []
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingEmoji, setIsLoadingEmoji] = useState(false);
  const [emojiError, setEmojiError] = useState('');
  const [showLogView, setShowLogView] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const theme = new Theme();
  const [svgPathSparkles, setSvgPathSparkles] = useState('/Images/UI/Sparkles.svg');


  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--dimension-text-color').trim();
    setSvgPathSparkles(theme.getSvgPathBasedOnTextColorAndName(textColor, 'Sparkles'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCard(prevCard => ({ ...prevCard, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = () => {
    onUpdate(editedCard);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setEditedCard({
      ...card,
      hasDeadline: !!card.deadline,
      logEntries: card.logEntries || []
    });
    setHasChanges(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject) => {
    setEditedCard(prevCard => ({ ...prevCard, emoji: emojiObject.emoji }));
    setShowEmojiPicker(false);
    setHasChanges(true); 
  };

  const handleDeadlineToggle = () => {
    setEditedCard(prevCard => ({
      ...prevCard,
      hasDeadline: !prevCard.hasDeadline,
      deadline: !prevCard.hasDeadline ? prevCard.deadline : null
    }));
    setHasChanges(true); 
  };


  const suggestEmoji = async () => {
    setIsLoadingEmoji(true);
    setEmojiError('');
    setShowEmojiPicker(false);

    if (!editedCard.content) {
      setEmojiError('Please enter a title before suggesting an emoji.');
      setIsLoadingEmoji(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Based on the following task title, suggest an emoji to represent it. Do not return any text besides one suggested emoji: "${editedCard.content}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestedEmoji = response.text().trim();

      if (isValidEmoji(suggestedEmoji)) {
        setEditedCard({ ...editedCard, emoji: suggestedEmoji });
      } else {
        throw new Error('Invalid emoji response');
      }
    } catch (error) {
      console.error("Error suggesting emoji:", error);
      setEmojiError('Something went wrong. Please try again, possibly with a different title.');
    } finally {
      setIsLoadingEmoji(false);
    }
  };

  const isValidEmoji = (str) => {
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;
    return emojiRegex.test(str);
  };
  const handleViewLog = () => {
    setShowLogView(true);
  };

  const handleBackToCard = () => {
    setShowLogView(false);
  };

  const handleAddLogEntry = (content) => {
    const newEntry = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toISOString()
    };
    const updatedCard = {
      ...editedCard,
      logEntries: [newEntry, ...editedCard.logEntries]
    };
    setEditedCard(updatedCard);
    onUpdate(updatedCard);
    // Ensure the log view stays open
    setShowLogView(true);
  };

  const handleDeleteLogEntry = (entryId) => {
    setEditedCard(prevCard => ({
      ...prevCard,
      logEntries: prevCard.logEntries.filter(entry => entry.id !== entryId)
    }));
    setHasChanges(true);
  };

  const handleEditLogEntry = (entryId, newContent) => {
    setEditedCard(prevCard => ({
      ...prevCard,
      logEntries: prevCard.logEntries.map(entry =>
        entry.id === entryId ? { ...entry, content: newContent } : entry
      )
    }));
    setHasChanges(true);
  };

  const LogView = ({ editedCard, onAddLogEntry, onBackToCard, onDeleteLogEntry, onEditLogEntry }) => {
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
  
    return (
      <>
        <div className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-2xl font-bold mb-4">
            {editedCard.emoji} {editedCard.content} Log
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
            {editedCard.logEntries.map(entry => (
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
          <button onClick={onBackToCard} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">Return to Task</button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4" style={{
        height: 'calc(100vh - 2rem)',
        maxHeight: '-webkit-fill-available',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showLogView ? (
          <LogView
            editedCard={editedCard}
            onAddLogEntry={handleAddLogEntry}
            onBackToCard={handleBackToCard}
            onDeleteLogEntry={handleDeleteLogEntry}
            onEditLogEntry={handleEditLogEntry}
          />
        ) : (
          <>
            <div className="p-6 overflow-y-auto flex-grow flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
              {editedCard.taskType === 'Pre-Existing Goal' && (
                <p className="mb-4 text-blue-600">This task is linked to a pre-existing goal.</p>
              )}
              <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label htmlFor="content" className="block mb-1">Title:</label>
              <input
                type="text"
                id="content"
                name="content"
                value={editedCard.content}
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
                  disabled={isLoadingEmoji || !editedCard.content}
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
                  className="emoji-button px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                >
                  {editedCard.emoji || 'Select an Emoji'}
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-10">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              {emojiError && <p className="text-red-500 text-sm mt-1">{emojiError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block mb-1">Status:</label>
              <p className="w-full p-2 bg-gray-100 rounded">{editedCard.status}</p>
            </div>
            <div className="mb-4">
              <div className="flex items-center">
                <Switch
                  checked={editedCard.hasDeadline}
                  onChange={handleDeadlineToggle}
                  color="primary"
                />
                <label htmlFor="hasDeadline" className="ml-2">Task has a Deadline</label>
              </div>
            </div>
            {editedCard.hasDeadline && (
              <div className="mb-4">
                <label htmlFor="deadline" className="block mb-1">Deadline:</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={editedCard.deadline || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
                <div className="mb-4">
                  <label htmlFor="description" className="block mb-1">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editedCard.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleViewLog}
                  className="w-full dimension-theme-colored px-4 py-2"
                >
                  View Task Log
                </button>
              </form>
              <button onClick={onDelete} className="mt-2 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center">Delete Task</button>
            </div>
            <div className="p-4 bg-gray-100 rounded-b-lg">
              {hasChanges ? (
                <div className="flex justify-between mb-2">
                  <button onClick={handleSubmit} className="dimension-theme-colored text-white px-4 py-2 rounded">Save Changes</button>
                    <button onClick={handleDiscard} className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-centerd">Discard Changes</button>
                  </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <button onClick={onClose} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">Exit</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ data = defaultData, onCardUpdate, onAddNewCard, onDeleteCard, onAddPreExistingGoal }) => {
  const [editingListId, setEditingListId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [openListOptionsId, setOpenListOptionsId] = useState(null);
  const listOptionsRef = useRef(null);
  const listOptionsButtonRef = useRef(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeListId, setActiveListId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listOptionsRef.current && !listOptionsRef.current.contains(event.target)) {
        setOpenListOptionsId(null);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
  
    if (!destination) {
      return;
    }
  
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
  
    if (type === 'list') {
      const newListOrder = Array.from(data.lists);
      const [reorderedList] = newListOrder.splice(source.index, 1);
      newListOrder.splice(destination.index, 0, reorderedList);
  
      setData({
        ...data,
        lists: newListOrder,
      });
      return;
    }
  
    const sourceList = data.lists.find(list => list.id === source.droppableId);
    const destinationList = data.lists.find(list => list.id === destination.droppableId);
    
    const sourceCardIds = Array.from(sourceList.cardIds);
    sourceCardIds.splice(source.index, 1);
    const newSourceList = {
      ...sourceList,
      cardIds: sourceCardIds,
    };
  
    const destinationCardIds = Array.from(destinationList.cardIds || []);
    destinationCardIds.splice(destination.index, 0, draggableId);
    const newDestinationList = {
      ...destinationList,
      cardIds: destinationCardIds,
    };
  
    const newState = {
      ...data,
      lists: data.lists.map(list => {
        if (list.id === newSourceList.id) {
          return newSourceList;
        } else if (list.id === newDestinationList.id) {
          return newDestinationList;
        } else {
          return list;
        }
      }),
    };
  
    setData(newState);
  };

  const handleListTitleClick = (listId) => {
    setEditingListId(listId);
  };

  const handleListTitleChange = (listId, newTitle) => {
    const newLists = data.lists.map(list =>
      list.id === listId ? { ...list, title: newTitle } : list
    );
    setData({ ...data, lists: newLists });
  };

  const handleListTitleBlur = () => {
    setEditingListId(null);
  };

  const addNewList = () => {
    const newListId = `list-${Date.now()}`;
    const newList = {
      id: newListId,
      title: 'New List',
      cardIds: [],
    };
    setData({
      ...data,
      lists: [...data.lists, newList],
    });
  };

  const addNewCard = (listId) => {
    const newCardId = `task-${Date.now()}`;
    const newCard = {
      id: newCardId,
      content: 'New Task',
      emoji: '📌',
      status: 'To Do',
      taskType: 'New Task',
      deadline: null,
      description: '',
    };
    const updatedList = data.lists.find(list => list.id === listId);
    updatedList.cardIds.push(newCardId);
    setData({
      ...data,
      lists: data.lists.map(list => list.id === listId ? updatedList : list),
      cards: {
        ...data.cards,
        [newCardId]: newCard,
      },
    });
  };

  const handleCardClick = (card) => {
    setEditingCard(card);
  };

  const handleCardUpdate = (updatedCard) => {
    setData({
      ...data,
      cards: {
        ...data.cards,
        [updatedCard.id]: updatedCard,
      },
    });
  };


  const handleListOptionsClick = (listId, event) => {
    event.stopPropagation();
    if (listId === openListOptionsId) {
      setOpenListOptionsId(null);
    } else {
        setOpenListOptionsId(listId);
    }
  };

  const handleDeleteList = (listId) => {
    setDeleteConfirmation(listId);
    setListOptionsOpen(null);
  };

  const confirmDeleteList = () => {
    const listToDelete = data.lists.find(list => list.id === deleteConfirmation);
    const newLists = data.lists.filter(list => list.id !== deleteConfirmation);
    const newCards = { ...data.cards };
    listToDelete.cardIds.forEach(cardId => {
      delete newCards[cardId];
    });

    setData({
      ...data,
      lists: newLists,
      cards: newCards,
    });
    setDeleteConfirmation(null);
  };

  const handleListStatusChange = (listId, status) => {
    setData(prevData => ({
      ...prevData,
      lists: prevData.lists.map(list =>
        list.id === listId ? { ...list, statusOfTasks: status } : list
      )
    }));
  };

  const ListOptionsPopup = ({ listId }) => {
    const list = data.lists.find(l => l.id === listId);
    return (
      <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 right-0 mt-2 w-64">
        <h4 className="text-sm font-bold mb-2 px-4 py-2">List Options</h4>
        <hr className="mb-2" />
        <div className="px-4 py-2">
          <label htmlFor={`list-status-${listId}`} className="block text-sm font-medium text-gray-700 mb-1">
            Status Of Tasks In This List:
          </label>
          <select
            id={`list-status-${listId}`}
            value={list.statusOfTasks || 'None'}
            onChange={(e) => handleListStatusChange(listId, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="None">None</option>
            <option value="Not Yet Started">Not Yet Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <hr className="my-2" />
        <button 
          onClick={() => handleDeleteList(listId)}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors duration-150 text-red-600"
        >
          Delete List
        </button>
      </div>
    );
  };

  const DeleteConfirmationModal = ({ listId }) => {
    const handleConfirm = (e) => {
      e.preventDefault(); // Prevent any default action
      confirmDeleteList();
    };

    const handleCancel = (e) => {
      e.preventDefault(); // Prevent any default action
      setDeleteConfirmation(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
          <p className="mb-6">Are you sure you want to delete this list and all its tasks?</p>
          <div className="flex justify-between">
            <button 
              onClick={handleConfirm}
              className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
            >
              Confirm
            </button>
            <button 
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [deleteTaskConfirmation, setDeleteTaskConfirmation] = useState(null);

  const handleDeleteTask = (taskId) => {
    setDeleteTaskConfirmation(taskId);
  };

  const confirmDeleteTask = () => {
    const taskId = deleteTaskConfirmation;
    const updatedLists = data.lists.map(list => ({
      ...list,
      cardIds: list.cardIds.filter(id => id !== taskId)
    }));
    const { [taskId]: deletedTask, ...updatedCards } = data.cards;
    
    setData({
      ...data,
      lists: updatedLists,
      cards: updatedCards
    });
    setEditingCard(null);
    setDeleteTaskConfirmation(null);
  };

  const DeleteTaskConfirmationModal = ({ taskId }) => {
    const task = data.cards[taskId];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">Confirm Delete Task</h3>
          <p className="mb-6">Are you sure you want to delete the task "{task.content}"?</p>
          <div className="flex justify-between">
            <button 
              onClick={confirmDeleteTask}
              className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
            >
              Delete
            </button>
            <button 
              onClick={() => setDeleteTaskConfirmation(null)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAddTaskClick = (listId) => {
    setActiveListId(listId);
    setShowAddTaskModal(true);
  };

  const handleAddNewTask = () => {
    onAddNewCard(activeListId);
    setShowAddTaskModal(false);
  };

  const handleAddPreExistingGoal = () => {
    onAddPreExistingGoal(activeListId);
    setShowAddTaskModal(false);
  };

  const AddTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md">
        <h3 className="text-xl font-bold mb-4">Add New Task</h3>
        <p className="mb-6">How would you like to add a new task?</p>
        <div className="flex justify-between">
          <button 
            onClick={handleAddNewTask}
            className="dimension-theme-colored px-4 py-2 rounded"
          >
            Add New Task
          </button>
          <button 
            onClick={handleAddPreExistingGoal}
            className="dimension-theme-colored px-4 py-2 rounded"
          >
            Use Pre-Existing Goal
          </button>
        </div>
        <button 
          onClick={() => setShowAddTaskModal(false)}
          className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-lists" direction="horizontal" type="list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex overflow-x-auto p-4"
          >
            {data != null && data.lists != null && data.lists.map((list, index) => (
              <Draggable key={list.id} draggableId={list.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="w-80 mx-2 relative"
                    style={provided.draggableProps.style}
                  >
                    <div className="bg-gray-100 rounded-md p-4">
                      <div {...provided.dragHandleProps} className="flex justify-between items-center mb-4">
                        {editingListId === list.id ? (
                          <input
                            type="text"
                            value={list.title}
                            onChange={(e) => handleListTitleChange(list.id, e.target.value)}
                            onBlur={handleListTitleBlur}
                            autoFocus
                            className="font-bold w-full p-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <>
                            <h3
                              onClick={() => handleListTitleClick(list.id)}
                              className="font-bold cursor-pointer"
                            >
                              {list.title}
                            </h3>
                            <button
                              ref={listOptionsButtonRef}
                              onClick={(e) => handleListOptionsClick(list.id, e)}
                              className="text-xl hover:bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-150"
                            >
                              ⋮
                            </button>
                          </>
                        )}
                      </div>
                      {openListOptionsId === list.id && (
                        <ListOptionsPopup listId={list.id} />
                      )}
                      <Droppable droppableId={list.id} type="task">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`h-[300px] overflow-y-auto ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
                            style={{
                              minHeight: '55px',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: snapshot.isDraggingOver ? 'rgba(229, 231, 235, 0.5)' : 'transparent',
                            }}
                          >
                            {(list.cardIds || []).map((cardId, index) => (
                              <Draggable
                                key={cardId}
                                draggableId={cardId}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => handleCardClick(data.cards[cardId])}
                                    className={`bg-white p-2 mb-2 rounded shadow cursor-pointer ${
                                      snapshot.isDragging ? 'opacity-50' : ''
                                    }`}
                                  >
                                    {data.cards[cardId].emoji} {data.cards[cardId].content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <button
                        onClick={() => handleAddTaskClick(list.id)}
                        className="w-full p-2 mt-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <div className="mx-2">
              <button
                onClick={addNewList}
                className="w-80 p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
              >
                + Add List
              </button>
            </div>
          </div>
        )}
      </Droppable>

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={() => onDeleteCard(editingCard.id)}
        />
      )}

      {deleteConfirmation && (
        <DeleteConfirmationModal listId={deleteConfirmation} />
      )}

      {showAddTaskModal && <AddTaskModal />}
    </DragDropContext>
  );
};

export default KanbanBoard;