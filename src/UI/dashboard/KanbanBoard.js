import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Switch } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Theme } from '../theme.js';
import GoalPicker from './GoalPicker';
import GoalCard from './GoalCard';
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
  const [svgPathSparkles, setSvgPathSparkles] = useState('/Images/UI/sparkles.svg');
  const emojiPickerRef = useRef(null);


  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--dimension-text-color').trim();
    setSvgPathSparkles(theme.getSvgPathBasedOnTextColorAndName(textColor, 'sparkles'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCard(prevCard => ({ ...prevCard, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg w-full max-w-md mx-4" style={{
        maxHeight: '-webkit-fill-available',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {editedCard.taskType === 'Pre-Existing Goal' ? (
          <>
            <div className="p-6 overflow-y-auto flex-grow flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Pre-Existing Goal Task</h2>
              <GoalCard goal={editedCard.pre_existing_goal} showUpdateButton={false} />
              <button onClick={onDelete} className="mt-4 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center">
                Remove Task
              </button>
            </div>
            <div className="p-4 bg-gray-100 rounded-b-lg">
              <button onClick={onClose} className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-150">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 overflow-y-auto flex-grow flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
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
                      className="emoji-button ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                    >
                      {editedCard.emoji || 'Select an Emoji'}
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
              <button onClick={onDelete} className="mt-2 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center">
                Delete Task
              </button>
            </div>
            <div className="p-4 bg-gray-100 rounded-b-lg">
              {hasChanges ? (
                <div className="flex justify-between mb-2">
                  <button onClick={handleSubmit} className="dimension-theme-colored text-white px-4 py-2 rounded">Save Changes</button>
                  <button onClick={handleDiscard} className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center">Discard Changes</button>
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

const KanbanBoard = ({ data, onCardUpdate, onAddNewCard, onDeleteCard, onAddPreExistingGoal, onListUpdate, existingGoals }) => {
  const [boardData, setBoardData] = useState(data);
  const [editingListId, setEditingListId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [openListOptionsId, setOpenListOptionsId] = useState(null);
  const listOptionsRef = useRef(null);
  const listOptionsButtonRefs = useRef({});
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [activeListStatus, setActiveListStatus] = useState(null);
  const [selectedPreExistingGoals, setSelectedPreExistingGoals] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const updateSelectedPreExistingGoals = (cards) => {
    const selectedGoals = Object.values(cards)
      .filter(card => card.taskType === 'Pre-Existing Goal')
      .map(card => card.pre_existing_goal.id);
    setSelectedPreExistingGoals(selectedGoals);
  };

  const checkAndUpdatePreExistingGoalTasks = () => {
    let updatedLists = [...boardData.lists];
    let updatedCards = { ...boardData.cards };
    let listsChanged = false;

    Object.values(updatedCards).forEach(card => {
      if (card.taskType === 'Pre-Existing Goal') {
        const currentList = updatedLists.find(list => list.cardIds.includes(card.id));
        if (currentList.statusOfTasks !== card.pre_existing_goal.status) {
          // Remove card from current list
          currentList.cardIds = currentList.cardIds.filter(id => id !== card.id);

          // Find or create appropriate list
          let appropriateList = updatedLists.find(list => list.statusOfTasks === card.pre_existing_goal.status);
          if (!appropriateList) {
            appropriateList = createNewList(card.pre_existing_goal.status);
            updatedLists.push(appropriateList);
          }

          // Add card to appropriate list
          appropriateList.cardIds.push(card.id);
          listsChanged = true;
        }
      }
    });

    if (listsChanged) {
      setBoardData(prevData => ({
        ...prevData,
        lists: updatedLists,
        cards: updatedCards
      }));
      onListUpdate(updatedLists);
    }
  };

  const createNewList = (status) => {
    const newListId = `list-${Date.now()}`;
    return {
      id: newListId,
      title: status,
      cardIds: [],
      statusOfTasks: status
    };
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openListOptionsId) {
        const listOptionsButton = listOptionsButtonRefs.current[openListOptionsId];
        if (
          listOptionsRef.current &&
          !listOptionsRef.current.contains(event.target) &&
          listOptionsButton &&
          !listOptionsButton.contains(event.target)
        ) {
          setOpenListOptionsId(null);
        }
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openListOptionsId]);

  const handleListOptionsClick = (listId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenListOptionsId(prevId => prevId === listId ? null : listId);
  };

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
        const newListOrder = Array.from(boardData.lists);
        const [reorderedList] = newListOrder.splice(source.index, 1);
        newListOrder.splice(destination.index, 0, reorderedList);

        const newData = {
            ...boardData,
            lists: newListOrder,
        };
        setBoardData(newData);
        onListUpdate(newListOrder);
        return;
    }

    const startList = boardData.lists.find(list => list.id === source.droppableId);
    const finishList = boardData.lists.find(list => list.id === destination.droppableId);

    if(boardData.cards[draggableId].taskType === 'Pre-Existing Goal') {
      if(boardData.cards[draggableId].status != finishList.statusOfTasks){
        //console.log("Incorrect Status of new list, cancelling drag.")
        return;
      }
    }

    if (startList === finishList) {
        const newCardIds = Array.from(startList.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        const newList = {
            ...startList,
            cardIds: newCardIds,
        };

        const newData = {
            ...boardData,
            lists: boardData.lists.map(list => 
                list.id === newList.id ? newList : list
            ),
        };

        setBoardData(newData);
        onListUpdate(newData.lists);
        return;
    }

    // Moving from one list to another
    const startCardIds = Array.from(startList.cardIds);
    startCardIds.splice(source.index, 1);
    const newStartList = {
        ...startList,
        cardIds: startCardIds,
    };

    const finishCardIds = Array.from(finishList.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinishList = {
        ...finishList,
        cardIds: finishCardIds,
    };

    const updatedCard = {
        ...boardData.cards[draggableId],
        status: finishList.statusOfTasks
    };

    const newData = {
        ...boardData,
        lists: boardData.lists.map(list => {
            if (list.id === newStartList.id) {
                return newStartList;
            } else if (list.id === newFinishList.id) {
                return newFinishList;
            } else {
                return list;
            }
        }),
        cards: {
            ...boardData.cards,
            [draggableId]: updatedCard,
        },
    };

    setBoardData(newData);
    onListUpdate(newData.lists);
    onCardUpdate(updatedCard);
};

  const handleListTitleClick = (listId) => {
    setEditingListId(listId);
  };
  
  const handleListTitleChange = (listId, newTitle) => {
    setBoardData(prevData => ({
      ...prevData,
      lists: prevData.lists.map(list =>
        list.id === listId ? { ...list, title: newTitle } : list
      )
    }));
    onListUpdate(boardData.lists.map(list =>
      list.id === listId ? { ...list, title: newTitle } : list
    ));
  };
  
  const handleListTitleBlur = (e) => {
    e.preventDefault();
    setEditingListId(null);
    onListUpdate(boardData.lists);
  };
  


  const addNewList = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!Array.isArray(boardData.lists)) {
      console.error('boardData.lists is not an array:', boardData.lists);
      setShowErrorPopup(true);
      setErrorMessage('The board data is corrupted. Please try reloading the page.');
      return;
    }
    const newListId = `list-${Date.now()}`;
    const newList = {
      id: newListId,
      title: 'New List',
      cardIds: [],
      statusOfTasks: 'None'
    };
    const updatedLists = [...boardData.lists, newList];
    setBoardData(prevData => ({
      ...prevData,
      lists: updatedLists
    }));
    onListUpdate(updatedLists);
  };
  


  const handleCardClick = (card) => {
    setEditingCard(card);
  };

  const handleListStatusChange = (listId, status) => {
    const updatedLists = boardData.lists.map(list =>
      list.id === listId ? { ...list, statusOfTasks: status } : list
    );

    const updatedCards = { ...boardData.cards };
    updatedLists.find(list => list.id === listId).cardIds.forEach(cardId => {
      updatedCards[cardId] = { ...updatedCards[cardId], status };
    });

    setBoardData(prevData => ({
      ...prevData,
      lists: updatedLists,
      cards: updatedCards
    }));
    onListUpdate(updatedLists);
    Object.values(updatedCards).forEach(card => onCardUpdate(card));
  };

  const handleCardUpdate = (updatedCard) => {
    setBoardData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [updatedCard.id]: updatedCard
      }
    }));
    onCardUpdate(updatedCard);
  };


  const handleDeleteList = (listId) => {
    setDeleteConfirmation({ type: 'list', id: listId });
    setOpenListOptionsId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmation.type === 'task') {
      const taskId = deleteConfirmation.id;
      const updatedLists = boardData.lists.map(list => ({
        ...list,
        cardIds: list.cardIds.filter(id => id !== taskId)
      }));
      const { [taskId]: deletedTask, ...updatedCards } = boardData.cards;
      
      setBoardData(prevData => ({
        ...prevData,
        lists: updatedLists,
        cards: updatedCards
      }));
      onListUpdate(updatedLists);
      onDeleteCard(taskId);
      setEditingCard(null);
    } else if (deleteConfirmation.type === 'list') {
      const listId = deleteConfirmation.id;
      const newLists = boardData.lists.filter(list => list.id !== listId);
      const newCards = { ...boardData.cards };
      boardData.lists.find(list => list.id === listId).cardIds.forEach(cardId => {
        delete newCards[cardId];
      });

      setBoardData(prevData => ({
        ...prevData,
        lists: newLists,
        cards: newCards,
      }));
      onListUpdate(newLists);
    }
    setDeleteConfirmation(null);
  };

  const ListOptionsPopup = ({ listId }) => {
    const list = boardData.lists.find(l => l.id === listId);
    return (
      <div 
        ref={listOptionsRef}
        className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 left-0 right-0 mt-2"
        onClick={(e) => e.stopPropagation()}
        style={{ top: '0%' }}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-bold px-4 py-2">"{list.title}" List Options</h4>
          <button 
            onClick={() => setOpenListOptionsId(null)}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
          >
            ✕
          </button>
        </div>
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

  const DeleteConfirmationModal = () => {
    const itemType = deleteConfirmation.type;
    const itemName = itemType === 'task' 
      ? boardData.cards[deleteConfirmation.id].content
      : boardData.lists.find(list => list.id === deleteConfirmation.id).title;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">Confirm Delete List</h3>
          <p className="mb-6">Are you sure you want to delete this {itemType}: "{itemName}"?</p>
          <div className="flex justify-between">
            <button 
              onClick={confirmDelete}
              className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
            >
              Delete
            </button>
            <button 
              onClick={() => setDeleteConfirmation(null)}
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

  const handleDeleteTask = (taskId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteTaskConfirmation(taskId);
  };

  const confirmDeleteTask = () => {
    const taskId = deleteTaskConfirmation;
    const updatedLists = boardData.lists.map(list => ({
      ...list,
      cardIds: list.cardIds.filter(id => id !== taskId)
    }));
    const { [taskId]: deletedTask, ...updatedCards } = boardData.cards;
    
    setBoardData(prevData => {
      const updatedData = {
        ...prevData,
        lists: updatedLists,
        cards: updatedCards
      };
      updateSelectedPreExistingGoals(updatedData.cards);
      return updatedData;
    });
    onListUpdate(updatedLists);
    onDeleteCard(taskId);
    setEditingCard(null);
    setDeleteTaskConfirmation(null);
  };

  const DeleteTaskConfirmationModal = ({ taskId, onConfirm, onCancel }) => {
    const handleConfirm = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onConfirm();
    };
  
    const handleCancel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleCancel}>
        <div className="bg-white p-8 rounded-lg max-w-md" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4">Confirm Delete Task</h3>
          <p className="mb-6">Are you sure you want to delete this task?</p>
          <div className="flex justify-between">
            <button 
              onClick={handleConfirm}
              className="border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center"
            >
              Delete
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

  const handleAddTaskClick = (listId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveListId(listId);
    setShowAddTaskModal(true);
  };

  const handleAddNewTask = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const list = boardData.lists.find(list => list.id === activeListId);
    const newCardId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCard = {
        id: newCardId,
        content: 'New Task',
        emoji: '',
        status: list.statusOfTasks,
        taskType: 'New Task',
        deadline: null,
        description: '',
        // Add any other necessary properties here
    };

    setBoardData(prevData => {
        const updatedList = prevData.lists.find(list => list.id === activeListId);
        if (!updatedList) {
            console.error(`List with ID ${activeListId} not found`);
            return prevData;
        }

        const updatedLists = prevData.lists.map(list => 
            list.id === activeListId 
                ? { ...list, cardIds: [...list.cardIds, newCardId] }
                : list
        );

        const updatedData = {
            ...prevData,
            lists: updatedLists,
            cards: {
                ...prevData.cards,
                [newCardId]: newCard
            }
        };

        return updatedData;
    });

    setShowAddTaskModal(false);
};

  const handleAddPreExistingGoal = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const list = boardData.lists.find(l => l.id === activeListId);
    setActiveListStatus(list.statusOfTasks);
    
    if (list.statusOfTasks !== 'None') {
      const availableGoals = existingGoals.filter(goal => 
        !selectedPreExistingGoals.includes(goal.id) &&
        goal.status === list.statusOfTasks
      );
      
      if (availableGoals.length === 0) {
        setErrorMessage(`You can't add goals to this list because its status (${list.statusOfTasks}) doesn't match any available goals. Please update the goal's status first.`);
        setShowErrorPopup(true);
        return;
      }
      
      setFilteredGoals(availableGoals);
    } else {
      const availableGoals = existingGoals.filter(goal => 
        !selectedPreExistingGoals.includes(goal.id)
      );
      setFilteredGoals(availableGoals);
    }
    
    setShowGoalPicker(true);
  };

  const ErrorPopup = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md">
        <h3 className="text-xl font-bold mb-4">Error</h3>
        <p className="mb-6">{message}</p>
        <button 
          onClick={onClose}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-150"
        >
          Close
        </button>
      </div>
    </div>
  );

  const handleGoalPickerSelect = (selectedGoal) => {
    addPreExistingGoalToList(activeListId, selectedGoal);
    setShowGoalPicker(false);
    setShowAddTaskModal(false);
  };

  const getAlreadyAddedGoalIds = () => {
    return Object.values(boardData.cards)
      .filter(card => card.taskType === 'Pre-Existing Goal')
      .map(card => card.pre_existing_goal.id);
  };

  const handleGoalPickerCancel = () => {
    setShowGoalPicker(false);
  };

  const addPreExistingGoalToList = (listId, goal) => {
    const newCardId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
    const newCard = {
      id: newCardId,
      content: goal.goal_name,
      emoji: goal.goal_emoji,
      status: goal.status,
      taskType: 'Pre-Existing Goal',
      pre_existing_goal: goal,
      deadline: goal.goal_deadline,
      description: goal.goal_description || ""
    };
  
    setBoardData(prevData => {
      const updatedList = prevData.lists.find(list => list.id === listId);
      if (!updatedList) {
        console.error(`List with ID ${listId} not found`);
        return prevData;
      }
  
      const updatedLists = prevData.lists.map(list => 
        list.id === listId 
          ? { ...list, cardIds: [...list.cardIds, newCardId] }
          : list
      );
  
      const updatedData = {
        ...prevData,
        lists: updatedLists,
        cards: {
          ...prevData.cards,
          [newCardId]: newCard
        }
      };
  
      updateSelectedPreExistingGoals(updatedData.cards);
      return updatedData;
    });

  };

  const handleErrorModalConfirm = () => {
    const goal = editingCard.pre_existing_goal;
    const appropriateList = boardData.lists.find(list => list.statusOfTasks === goal.status);
    if (appropriateList) {
      addPreExistingGoalToList(appropriateList.id, goal);
    } else {
      const newList = createNewList(goal.status);
      setBoardData(prevData => ({
        ...prevData,
        lists: [...prevData.lists, newList]
      }));
      addPreExistingGoalToList(newList.id, goal);
    }
    setShowErrorModal(false);
  };

  const AddTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => e.stopPropagation()}>
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
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddTaskModal(false); }}
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
            style={{ minHeight: '275px' }}
          >
            {boardData != null && boardData.lists != null && boardData.lists.map((list, index) => (
              <Draggable key={list.id} draggableId={list.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="w-60 mx-2 relative"
                    style={provided.draggableProps.style}
                  >
                    <div className="w-60 bg-gray-100 rounded-md p-4">
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
                              ref={(el) => listOptionsButtonRefs.current[list.id] = el}
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
                            {(list.cardIds || []).map((cardId, index) => {
                              const card = boardData.cards[cardId];
                              
                              if (!card) {
                                console.error(`Card with ID ${cardId} not found in boardData.cards`);
                                return null;
                              }

                              return (
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
                                      onClick={() => handleCardClick(card)}
                                      className={`bg-white p-2 mb-2 rounded shadow cursor-pointer ${
                                        snapshot.isDragging ? 'opacity-50' : ''
                                      }`}
                                    >
                                      {card.emoji} {card.content}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <button
                        onClick={(e) => handleAddTaskClick(list.id, e)}
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
                className="w-60 p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
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
          onDelete={(event) => handleDeleteTask(editingCard.id, event)}
        />
      )}

      {deleteTaskConfirmation && (
        <DeleteTaskConfirmationModal
          taskId={deleteTaskConfirmation}
          onConfirm={confirmDeleteTask}
          onCancel={() => setDeleteTaskConfirmation(null)}
        />
      )}

      {deleteConfirmation && <DeleteConfirmationModal />}

      {showAddTaskModal && <AddTaskModal />}
      {showGoalPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <GoalPicker
            goals={filteredGoals}
            onSelect={handleGoalPickerSelect}
            onCancel={() => setShowGoalPicker(false)}
            initialFilter={activeListStatus}
          />
        </div>
      )}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <p>{errorMessage}</p>
            <div className="mt-4 flex justify-between">
              <button onClick={handleErrorModalConfirm} className="dimension-theme-colored px-4 py-2 rounded">Yes</button>
              <button onClick={() => setShowErrorModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">No</button>
            </div>
          </div>
        </div>
      )}
      {showErrorPopup && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </DragDropContext>
  );
};

export default KanbanBoard;