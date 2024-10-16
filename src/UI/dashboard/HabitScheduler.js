import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  format, 
  parse, 
  differenceInMinutes, 
  addMinutes, 
  setMinutes, 
  getMinutes, 
  setHours, 
  getHours, 
  addDays, 
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, getDay
} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from '@mui/material';
import ColorPicker from '../components/ColorPicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

//TODO: 
//      Create a monthly view, adjust weekly/daily view to render specific weeks/days of the year


const MINUTES_IN_SCHEDULER = 25 * 60;
const MINUTES_IN_DAY = 24 * 60;
const HOUR_HEIGHT = 60; // pixels
const HOUR_LABEL_WIDTH = 60; // pixels

const DEFAULT_EVENT_DURATION = 30; // minutes
const DRAG_INTERVAL = 5; // minutes

const ANY_TIME_HEIGHT = 100; // pixels
const SECTION_GAP = 20; // pixels
const SCROLL_THRESHOLD = 50; // pixels from top/bottom to trigger scrolling

const lightenColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

const darkenColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.max(0, Math.min(255, parseInt(color, 16) - amount)).toString(16)).substr(-2));
};

const truncateText = (text, maxLength = 14) => {
  if(text){
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
};

const isColorLight = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155; // You can adjust this threshold
};

const getLastDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getLastWeekOfMonth = (date, targetDayOfWeek) => {
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const targetDay = new Date(lastDayOfMonth);
  
  while (format(targetDay, 'EEE') !== targetDayOfWeek) {
    targetDay.setDate(targetDay.getDate() - 1);
  }
  
  return Math.ceil(targetDay.getDate() / 7);
};

const isNthDayOfMonth = (date, n, dayOfWeek) => {
  const day = format(date, 'EEE');
  if (day !== dayOfWeek) return false;

  if (n === 5) { // "Last" occurrence
    const nextWeek = addWeeks(date, 1);
    return nextWeek.getMonth() !== date.getMonth();
  } else {
    return Math.ceil(date.getDate() / 7) === n;
  }
};

//for action.monthlyRules but could be reused
const removeDuplicateRules = (rules) => {
  const uniqueRules = [];
  const seenRules = new Set();

  for (const rule of rules) {
    const ruleKey = `${rule.value}-${JSON.stringify(rule.ruleValue)}`;
    if (!seenRules.has(ruleKey)) {
      seenRules.add(ruleKey);
      uniqueRules.push(rule);
    }
  }

  return uniqueRules;
};

const HabitScheduler = ({ habitData, onHabitDataChange, currentDimension }) => {
  const habitSchedulerRef = useRef(null);
  const [localHabitData, setLocalHabitData] = useState(habitData);
  const [showHabitScheduler, setShowHabitScheduler] = useState(false);
  const [isActionSchedulerMinimized, setIsActionSchedulerMinimized] = useState(true);
  const [scheduleActions, setScheduleActions] = useState([]);
  const [dynamicEvents, setDynamicEvents] = useState([]);
  const [draggedEvents, setDraggedEvents] = useState(null);
  const [dragIndicator, setDragIndicator] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  const [isDailySchedulerMinimized, setIsDailySchedulerMinimized] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]);
  const actionSchedulerContentRef = useRef(null);
  const dayViewRegularScheduleRef = useRef(null);
  const [anyTimeEvents, setAnyTimeEvents] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIntervalRef = useRef(null);
  const lastMousePositionRef = useRef({ clientX: 0, clientY: 0 });
  const dayViewSchedulerRef = useRef(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const setIsDraggingTouchWithLog = (value) => {
    setIsDraggingTouch(value);
  };
  const touchStartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentMinimizedAction, setCurrentMinimizedAction] = useState(0);
  const getRandomColor = () => {
    const colors = ['#FDE047', '#FFA500', '#EF4444', '#A855F7', '#3B82F6', '#22C55E'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getDefaultColorForDimension = React.useCallback((dimension) => {
    const colorMap = {
      'Sol': '#FDE047', // Yellow
      'Amber': '#FFA500', // Orange
      'Red': '#EF4444', // Red
      'Violet': '#A855F7', // Purple
      'Jean': '#3B82F6', // Blue
      'Ivy': '#22C55E', // Green
      'Spectrum': getRandomColor()
    };

    return colorMap[dimension] || getRandomColor();
  }, []);
  const [globalActionColor, setGlobalActionColor] = useState(() => getDefaultColorForDimension(currentDimension));

  useEffect(() => {
    const newColor = getDefaultColorForDimension(currentDimension);
    setGlobalActionColor(newColor);
  }, [currentDimension, getDefaultColorForDimension]);

  const handleGlobalColorChange = (color) => {
    setGlobalActionColor(color);
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {
      const dayView = document.querySelector('.day-view');
      const weekView = document.querySelector('.week-view');
      if ((dayView && dayView.contains(event.target)) || (weekView && weekView.contains(event.target))) {
        if (!event.target.closest('.event-item')) {
          setSelectedEvents([]);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const preventScroll = useCallback((e) => {
    if (isDraggingTouch) {
      e.preventDefault();
    }
  }, [isDraggingTouch]);

  useEffect(() => {
    const scheduler = dayViewSchedulerRef.current;
    if (scheduler) {
      scheduler.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      if (scheduler) {
        scheduler.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [preventScroll]);

  useEffect(() => {
    const events = scheduleActions
      .filter(action => action.type === 'scheduled' && action.startTime)
      .map((action) => ({
        ...action,
        endTime: action.endTime || format(addMinutes(parse(action.startTime, 'HH:mm', new Date()), DEFAULT_EVENT_DURATION), 'HH:mm'),
      }));
    setDynamicEvents(assignColumns(events));

    const unspecifiedEvents = scheduleActions
      .filter(action => action.type === 'unspecified')
      .map((action) => ({
        ...action,
      }));
    setAnyTimeEvents(unspecifiedEvents);
    console.log("Current scheduleActions: ", scheduleActions)
  }, [scheduleActions]);

  useEffect(() => {
    setLocalHabitData(habitData);
  }, [habitData]);

  const updateLocalHabitData = (updates) => {
    const updatedHabitData = { ...localHabitData, ...updates };
    setLocalHabitData(updatedHabitData);
    onHabitDataChange(updatedHabitData);
  };

  const handleHabitSchedulerToggle = () => {
    setShowHabitScheduler(!showHabitScheduler);
    if (!HabitScheduler) {
      updateLocalHabitData({ scheduleActions });
    } 
    // else {
    //   updateLocalHabitData({ scheduleActions: [] });
    // }
  };

  const handleActionTypeChange = (id, type) => {
    const updatedActions = scheduleActions.map((action) => {
      if (action.id === id) {
        if (type === 'scheduled') {
          const startTime = '00:00'; // Set start time to 12:00 AM
          const endTime = format(addMinutes(parse(startTime, 'HH:mm', new Date()), DEFAULT_EVENT_DURATION), 'HH:mm');
          return {
            ...action,
            type,
            startTime,
            endTime
          };
          
        } else {
          return { ...action, type, startTime: '', endTime: '' };
        }
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });

    // Update dynamicEvents state
    const newDynamicEvents = updatedActions
      .filter(action => action.type === 'scheduled')
      .map(action => ({
        id: action.id,
        startTime: action.startTime,
        endTime: action.endTime,
        type: 'scheduled'
      }));
    setDynamicEvents(assignColumns(newDynamicEvents));
  };

  const handleTimeChange = (id, field, value) => {
    const updatedActions = scheduleActions.map((action) => {
      if (action.id === id) {
        return { ...action, [field]: value };
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  };

  const renderTimeInput = (id, field) => {
    const action = scheduleActions.find(a => a.id === id);
    return (
      <input
        type="time"
        value={action[field]}
        onChange={(e) => handleTimeChange(id, field, e.target.value)}
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
      />
    );
  };

  const isMouseOverEvent = (mouseEvent, schedulerRect, anyTimeRect) => {
    const mouseY = mouseEvent.clientY;
    const mouseX = mouseEvent.clientX - HOUR_LABEL_WIDTH;

    // Check "Any Time" events
    if (mouseY >= anyTimeRect.top && mouseY <= anyTimeRect.bottom) {
      return anyTimeEvents.find(e => {
        const eventRect = mouseEvent.target.getBoundingClientRect();
        return mouseY >= eventRect.top && mouseY <= eventRect.bottom && 
               mouseX >= eventRect.left && mouseX <= eventRect.right;
      });
    }

    // Check scheduled events
    if (mouseY >= schedulerRect.top && mouseY <= schedulerRect.bottom) {
      return dynamicEvents.find(e => {
        let start = getMinutesFromMidnight(e.startTime);
        let end = getMinutesFromMidnight(e.endTime);
        
        if (end < start) end += MINUTES_IN_SCHEDULER;

        const startY = (start / MINUTES_IN_SCHEDULER) * schedulerRect.height;
        const endY = (end / MINUTES_IN_SCHEDULER) * schedulerRect.height;
        
        const columnWidth = e.isOverlapping ? 100 / (e.maxColumn + 1) : 100;
        const left = e.isOverlapping ? (e.column * columnWidth) : 0;
        const width = columnWidth;

        const eventLeft = (left / 100) * (schedulerRect.width - HOUR_LABEL_WIDTH);
        const eventWidth = (width / 100) * (schedulerRect.width - HOUR_LABEL_WIDTH);

        const isOverVertically = mouseY >= schedulerRect.top + startY && mouseY <= schedulerRect.top + endY;
        const isOverHorizontally = mouseX >= eventLeft && mouseX <= (eventLeft + eventWidth);

        return isOverVertically && isOverHorizontally;
      });
    }

    return null;
  };

  const constrainEventTime = (minutes) => {
    return Math.max(0, Math.min(minutes, MINUTES_IN_SCHEDULER - 5));
  };

  const roundToInterval = (minutes) => {
    return Math.round(minutes / DRAG_INTERVAL) * DRAG_INTERVAL;
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return '';
    }
    const hours = parseInt(timeString.split(':')[0]);
    if (hours >= 24) {
      timeString = `${hours % 24}:${timeString.split(':')[1]}`;
    }
    let date = parse(timeString, 'HH:mm', new Date());
    return format(date, use24HourFormat ? 'HH:mm' : 'h:mm a');
  };

  const formatHourLabels = (hour) => {
    if (use24HourFormat) {
      return hour === 24 ? '+00:00' : format(new Date().setHours(hour, 0), 'HH:mm');
    } 
      return hour === 24 ? '+12 AM' : format(new Date().setHours(hour, 0), 'h a');
  };

  const assignColumns = (events) => {
    // Sort events by last dragged time, preserving order for equal times
    const sortedEvents = [...events].sort((a, b) => {
      // const startA = getMinutesFromMidnight(a.startTime);
      // const startB = getMinutesFromMidnight(b.startTime);
      // if (startA !== startB) return startA - startB;
      const timeA = a.lastDragged || 0;
      const timeB = b.lastDragged || 0;
      if (timeA === timeB) {
        // If lastDragged times are equal, maintain current order
        return events.indexOf(a) - events.indexOf(b);
      }
      return timeB - timeA;
    });
  
    const columns = [];
    sortedEvents.forEach(event => {
      const startMinutes = getMinutesFromMidnight(event.startTime);
      let endMinutes = getMinutesFromMidnight(event.endTime);
      if (endMinutes <= startMinutes) endMinutes += MINUTES_IN_DAY;
  
      let column = 0;
      while (columns[column]?.some(existingEvent => {
        const existingStart = getMinutesFromMidnight(existingEvent.startTime);
        let existingEnd = getMinutesFromMidnight(existingEvent.endTime);
        if (existingEnd <= existingStart) existingEnd += MINUTES_IN_DAY;
        return (startMinutes < existingEnd && endMinutes > existingStart);
      })) {
        column++;
      }
  
      if (!columns[column]) columns[column] = [];
      columns[column].push(event);
    });
  
    return columns.flatMap((column, columnIndex) => 
      column.map(event => {
        const isOverlapping = sortedEvents.some(otherEvent => {
          if (event.id === otherEvent.id) return false;
          
          const eventStart = getMinutesFromMidnight(event.startTime);
          let eventEnd = getMinutesFromMidnight(event.endTime);
          if (eventEnd <= eventStart) eventEnd += MINUTES_IN_DAY;
          
          const otherStart = getMinutesFromMidnight(otherEvent.startTime);
          let otherEnd = getMinutesFromMidnight(otherEvent.endTime);
          if (otherEnd <= otherStart) otherEnd += MINUTES_IN_DAY;
          
          return (eventStart < otherEnd && eventEnd > otherStart);
        });

        return {
          ...event,
          column: columnIndex,
          maxColumn: columns.length - 1,
          isOverlapping
        };
      })
    );
  };
  
  const updateDraggedEventsPosition = () => {
    if (draggedEvents && draggedEvents.length > 0 && dayViewRegularScheduleRef.current) {
      const schedulerRect = dayViewRegularScheduleRef.current.getBoundingClientRect();
      const anyTimeRect = dayViewRegularScheduleRef.current.previousSibling.getBoundingClientRect();
      const currentMouseY = lastMousePositionRef.current.clientY;
      const schedulerTop = schedulerRect.top + window.scrollY;
      const relativeMouseY = currentMouseY + window.scrollY - schedulerTop;
  
      // Use the clicked event as the reference for movement
      const clickedEvent = draggedEvents.find(de => de.isClicked) || draggedEvents[0];
      const newStartMinutes = Math.floor((relativeMouseY / schedulerRect.height) * MINUTES_IN_SCHEDULER);
      const roundedStartMinutes = roundToInterval(newStartMinutes);
      const adjustedStartMinutes = Math.min(Math.max(roundedStartMinutes, 0), MINUTES_IN_DAY - 5);
      const moveDelta = adjustedStartMinutes - (clickedEvent.initialStartTime ? getMinutesFromMidnight(clickedEvent.initialStartTime) : 0);
  
      const currentTime = Date.now();
      let updatedEvents = [...dynamicEvents, ...anyTimeEvents].map(e => {
        const draggedEvent = draggedEvents.find(de => de.id === e.id);
        if (draggedEvent) {
          const originalStartMinutes = draggedEvent.initialStartTime ? getMinutesFromMidnight(draggedEvent.initialStartTime) : 0;
          // Moving into Any Time Section
          if (relativeMouseY < 0 || ((originalStartMinutes + moveDelta) < 0)) {
            return { ...e, type: 'unspecified', startTime: '', endTime: '', lastDragged: currentTime };
          } 
          // Moving out of Any Time Section or within regular schedule
          else {
            let newStartMinutes = (originalStartMinutes + moveDelta + MINUTES_IN_DAY) % MINUTES_IN_DAY;
            if (originalStartMinutes + moveDelta >= MINUTES_IN_DAY) {
              newStartMinutes = MINUTES_IN_DAY - DRAG_INTERVAL;
            }
  
            const newStartTime = formatMinutesToTime(newStartMinutes);
            const originalDuration = draggedEvent.isAnyTime || !draggedEvent.initialEndTime ? DEFAULT_EVENT_DURATION : 
              (getMinutesFromMidnight(draggedEvent.initialEndTime) - getMinutesFromMidnight(draggedEvent.initialStartTime) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
            
            const newEndMinutes = (newStartMinutes + originalDuration) % MINUTES_IN_DAY;
            const newEndTime = formatMinutesToTime(newEndMinutes);
  
            return { 
              ...e, 
              type: 'scheduled', 
              startTime: newStartTime, 
              endTime: newEndTime,
              lastDragged: currentTime
            };
          }
        }
        return e;
      });
  
      const scheduledEvents = updatedEvents.filter(e => e.type === 'scheduled');
      const assignedEvents = assignColumns(scheduledEvents);
      
      setDynamicEvents(assignedEvents);
      setAnyTimeEvents(updatedEvents.filter(e => e.type === 'unspecified'));
  
      // Update drag indicator (showing for the clicked event in multi-select)
      const draggedEvent = assignedEvents.find(e => e.id === clickedEvent.id);
      if (draggedEvent) {
        const startMinutes = getMinutesFromMidnight(draggedEvent.startTime);
        const endMinutes = getMinutesFromMidnight(draggedEvent.endTime);
        setDragIndicator({
          startTime: draggedEvent.startTime,
          endTime: draggedEvent.endTime,
          isAnyTime: false,
          top: (startMinutes / MINUTES_IN_SCHEDULER) * schedulerRect.height,
          height: ((endMinutes - startMinutes + MINUTES_IN_DAY) % MINUTES_IN_DAY) / MINUTES_IN_SCHEDULER * schedulerRect.height
        });
      } else {
        setDragIndicator(null);
      }
    }
  };

const toggleDailySchedulerMinimize = () => {
  setIsDailySchedulerMinimized(!isDailySchedulerMinimized);
  setIsWeeklySchedulerMinimized(!isDailySchedulerMinimized);
  setIsMonthlySchedulerMinimized(!isDailySchedulerMinimized)
  if (!isDailySchedulerMinimized) {
    // Clear selected events when minimizing
    setSelectedEvents([]);
  }
};

  const getOrdinalSuffix = (num) => {
    const j = num % 10,
          k = num % 100;
    if (j == 1 && k != 11) {
      return "st";
    }
    if (j == 2 && k != 12) {
      return "nd";
    }
    if (j == 3 && k != 13) {
      return "rd";
    }
    return "th";
  };

  const toggleActionSchedulerMinimize = () => {
    setIsActionSchedulerMinimized(!isActionSchedulerMinimized);
  };

  const getEventFromPoint = (x, y) => {
    const anyTimeRect = dayViewRegularScheduleRef.current.previousSibling.getBoundingClientRect();
    const schedulerRect = dayViewRegularScheduleRef.current.getBoundingClientRect();

    // Check "Any Time" events
    if (y >= anyTimeRect.top && y <= anyTimeRect.bottom) {
      return anyTimeEvents.find(event => {
        const eventEl = document.getElementById(`event-${event.id}`);
        if (eventEl) {
          const eventRect = eventEl.getBoundingClientRect();
          return x >= eventRect.left && x <= eventRect.right &&
                 y >= eventRect.top && y <= eventRect.bottom;
        }
        return false;
      });
    }

    // Check scheduled events
    if (y >= schedulerRect.top && y <= schedulerRect.bottom) {
      const relativeY = y - schedulerRect.top;
      const relativeX = x - schedulerRect.left - HOUR_LABEL_WIDTH;
  
      return dynamicEvents.find(event => {
        let startMinutes = getMinutesFromMidnight(event.startTime);
        let endMinutes = getMinutesFromMidnight(event.endTime);
        
        // Handle events that cross midnight
        if (endMinutes <= startMinutes) {
          endMinutes += MINUTES_IN_DAY;
        }
        
        const eventTop = (startMinutes / MINUTES_IN_SCHEDULER) * schedulerRect.height;
        const eventBottom = (endMinutes / MINUTES_IN_SCHEDULER) * schedulerRect.height;
        
        const columnWidth = event.isOverlapping ? (schedulerRect.width - HOUR_LABEL_WIDTH) / (event.maxColumn + 1) : schedulerRect.width - HOUR_LABEL_WIDTH;
        const eventLeft = event.isOverlapping ? event.column * columnWidth : 0;
        const eventRight = eventLeft + columnWidth;
  
        return relativeY >= eventTop && relativeY <= eventBottom &&
               relativeX >= eventLeft && relativeX <= eventRight;
      });
    }
  
    return null;
  };

  const preventDefaultForTouch = useCallback((e) => {
    if (isDragging || isDraggingTouch) {
      e.preventDefault();
    }
  }, [isDragging, isDraggingTouch]);
  
  useEffect(() => {
    const scheduler = dayViewSchedulerRef.current;
    if (scheduler) {
      scheduler.addEventListener('touchmove', preventDefaultForTouch, { passive: false });
    }
  
    return () => {
      if (scheduler) {
        scheduler.removeEventListener('touchmove', preventDefaultForTouch);
      }
    };
  }, [preventDefaultForTouch]);

  const handleAnyTimeEventClick = useCallback((event) => {
    if (!isDailySchedulerMinimized && window.innerWidth <= 768) { // Assuming mobile breakpoint is 768px
      const updatedEvents = anyTimeEvents.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            type: 'scheduled',
            startTime: '00:00',
            endTime: format(addMinutes(parse('00:00', 'HH:mm', new Date()), DEFAULT_EVENT_DURATION), 'HH:mm'),
            lastDragged: Date.now()
          };
        }
        return e;
      });

      const newDynamicEvents = [...dynamicEvents, updatedEvents.find(e => e.id === event.id)];
      setDynamicEvents(assignColumns(newDynamicEvents));
      setAnyTimeEvents(updatedEvents.filter(e => e.type === 'unspecified'));

      // Update scheduleActions
      const updatedActions = scheduleActions.map(action => {
        if (action.id === event.id) {
          return {
            ...action,
            type: 'scheduled',
            startTime: '00:00',
            endTime: format(addMinutes(parse('00:00', 'HH:mm', new Date()), DEFAULT_EVENT_DURATION), 'HH:mm'),
            lastDragged: Date.now()
          };
        }
        return action;
      });
      setScheduleActions(updatedActions);
      updateLocalHabitData({ scheduleActions: updatedActions });
    }
  }, [isDailySchedulerMinimized, anyTimeEvents, dynamicEvents, scheduleActions, updateLocalHabitData]);

  const getActionIndex = (eventId) => {
    return scheduleActions.findIndex(action => action.id === eventId);
  };

useEffect(() => {
  if (habitData.scheduleActions && habitData.habit_frequencyNum > 0) {
    const currentTime = new Date();
    if(habitData.scheduleActions.length === 0){
      const initialActions = Array(habitData.habit_frequencyNum).fill().map(() => ({
        id: uuidv4(),
        type: 'unspecified',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(addMinutes(currentTime, DEFAULT_EVENT_DURATION), 'HH:mm'),
        weekDaySpecificity: 'any',
        selectedDays: [],
        monthlyDaySpecificity: 'any',
        monthlyRules: []
      }));
      setScheduleActions(initialActions);
      updateLocalHabitData({ scheduleActions: initialActions });
    }
  }
}, [habitData.habit_frequencyNum]);

useEffect(() => {
  const currentTime = new Date();
  const newActions = Array(localHabitData.habit_frequencyNum).fill().map((_, index) => {
    const existingAction = scheduleActions[index];
    if (existingAction) {
      return {
        ...existingAction,
        monthlyRules: existingAction.monthlyRules || []
      };
    } else {
      return {
        id: uuidv4(),
        type: 'unspecified',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(addMinutes(currentTime, DEFAULT_EVENT_DURATION), 'HH:mm'),
        weekDaySpecificity: 'any',
        selectedDays: [],
        monthlyDaySpecificity: 'any',
        monthlyRules: []
      };
    }
  });
  setScheduleActions(newActions);
  updateLocalHabitData({ scheduleActions: newActions });
}, [localHabitData.habit_frequencyPeriod, localHabitData.habit_frequencyNum]);

  const renderDailyScheduler = () => {
    return (
      <div className="mt-6 relative">
        {localHabitData.habit_frequencyPeriod === 'daily' && (
          <div className="freqPeriodSchedulerTitle flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Daily Scheduler</h3>
            <div className="flex items-center space-x-4">
              {dynamicEvents.length > 0 && (
                <div className="flex items-center cursor-pointer">
                  <span className="font-semibold">12h</span>
                  <Switch
                    checked={use24HourFormat}
                    onChange={() => setUse24HourFormat(!use24HourFormat)}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: '#9ca3af', // gray-400
                        '&.Mui-checked': {
                          color: '#4b5563', // gray-600
                        },
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: '#d1d5db', // gray-300
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#9ca3af', // gray-400
                      },
                    }}
                  />
                  <span className="font-semibold">24h</span>
                </div>
              )}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDailySchedulerMinimize(); }}
                className="w-6 h-6 flex items-center justify-center dimension-theme-colored"
              >
                {isDailySchedulerMinimized ? '+' : '-'}
              </button>
            </div>
          </div>
        )}
        <DayView 
          day={new Date()} 
          events={dynamicEvents} 
          anyTimeEvents={anyTimeEvents} 
          onDayChange={() => {}} 
        />
      </div>
    );
  };

  const [weeklySchedulercurrentView, setWeeklySchedulerCurrentView] = useState('week');
  const [weeklySchedulerselectedDay, setWeeklySchedulerSelectedDay] = useState(new Date());
  const [isWeeklySchedulerMinimized, setIsWeeklySchedulerMinimized] = useState(false);
  const toggleWeeklySchedulerMinimize = () => {
    setIsWeeklySchedulerMinimized(!isWeeklySchedulerMinimized);
    setIsMonthlySchedulerMinimized(!isWeeklySchedulerMinimized)
    setIsDailySchedulerMinimized(!isWeeklySchedulerMinimized);
    if (!isWeeklySchedulerMinimized) {
      // Clear selected events when minimizing
      setSelectedEvents([]);
    }
  };

  const onEventMoveWeekView = (eventId, sourceId, destId) => {
    const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const eventIdSuffix = eventId.slice(-3);
    if (dayAbbreviations.includes(eventIdSuffix)) {
      eventId = eventId.slice(0, -3);
    }
  
    const updatedActions = scheduleActions.map(action => {
      if (action.id === eventId) {
        let newSelectedDays = [...(action.selectedDays || [])];
        let newWeekDaySpecificity = action.weekDaySpecificity;
        let newMonthlyRules = [...(action.monthlyRules || [])];
  
        if (destId === 'any-day') {
          newSelectedDays = [];
          newWeekDaySpecificity = 'any';
        } else {
          const destDay = format(parse(destId, 'EEEE', new Date()), 'EEEE');
          
          if (sourceId === 'any-day') {
            newSelectedDays = [destDay];
            newWeekDaySpecificity = 'specific';
          } else {
            const sourceDay = format(parse(sourceId, 'EEEE', new Date()), 'EEEE');
            newSelectedDays = newSelectedDays.filter(day => day !== sourceDay);
            if (!newSelectedDays.includes(destDay)) {
              newSelectedDays.push(destDay);
            }
            newWeekDaySpecificity = 'specific';
          }
        }
  
        let updatedMonthlyDaySpecificty = action.monthlyDaySpecificity;
        // Handle monthly frequency period
        if (localHabitData.habit_frequencyPeriod === 'monthly') {
          if (newWeekDaySpecificity !== action.weekDaySpecificity) {
            if (newWeekDaySpecificity === 'any') {
              // Remove any 'specific' rules
              newMonthlyRules = newMonthlyRules.filter(rule => rule.value !== 'specific');
              if(newMonthlyRules.length <= 0){
              updatedMonthlyDaySpecificty = 'any';
              }
            } else if (newWeekDaySpecificity === 'specific') {
              updatedMonthlyDaySpecificty = 'specific';
              // Add a new 'specific' rule
              newMonthlyRules.push({
                id: uuidv4(),
                value: 'specific',
                ruleValue: null
              });
            }
          }
        }
  
        return {
          ...action,
          selectedDays: newSelectedDays,
          weekDaySpecificity: newWeekDaySpecificity,
          monthlyDaySpecificity: updatedMonthlyDaySpecificty,
          monthlyRules: removeDuplicateRules(newMonthlyRules)
        };
      }
      return action;
    });
  
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  };
  const onEventMoveMonthView = (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
  
    const eventId = draggableId; // Remove the day suffix if present
    const sourceId = source.droppableId;
    const sourceDate = sourceId === 'any-day' ? null : parse(sourceId, 'yyyy-MM-dd', new Date());
    const destId = destination.droppableId;

    const getNumActionsOnSourceDate = (date) => {
      if (!date) return 0;
      
      return scheduleActions.reduce((count, action) => {
        if (checkForActionOnDate(action, date)) {
          return count + 1;
        }
        return count;
      }, 0);
    };
    const checkForActionOnDate = (action, date) => {
      if (!date || !action.monthlyRules || action.monthlyRules.length === 0) {
        return false;
      }
  
      const dayOfMonth = date.getDate();
  
      return action.monthlyRules.some(rule => {
        switch (rule.value) {
          case 'fixed':
            return dayOfMonth === rule.ruleValue || 
              (dayOfMonth === getLastDayOfMonth(date) && dayOfMonth < rule.ruleValue && rule.ruleValue >= 29);
          case 'ordinal':
            const [nthOccurrence, targetDayOfWeek] = rule.ruleValue;
            return isNthDayOfMonth(date, parseInt(nthOccurrence), targetDayOfWeek);
          case 'specific':
            return action.weekDaySpecificity === 'any' || 
              (action.selectedDays && action.selectedDays.includes(format(date, 'EEEE')));
          default:
            return false;
        }
      });
    };
    const numActionsOnSourceDate = getNumActionsOnSourceDate(sourceDate);
  
    const updatedActions = scheduleActions.map(action => {
      if (eventId.includes(action.id) || (numActionsOnSourceDate > 2 && checkForActionOnDate(action, sourceDate))) {
        let newMonthlyRules = [...(action.monthlyRules || [])];
        let newMonthlyDaySpecificity = action.monthlyDaySpecificity;
        let newWeekDaySpecificity = action.weekDaySpecificity;
        let newSelectedDays = [...(action.selectedDays || [])];
  
        if (destId === 'any-day') {
          newMonthlyRules = [];
          newMonthlyDaySpecificity = 'any';
          newWeekDaySpecificity = 'any';
          newSelectedDays = [];
        } else {
  
  
          if (sourceId === 'any-day') {
            // Moving from 'any-day' to a specific day
            const destDate = parse(destId, 'yyyy-MM-dd', new Date());
            const dayOfMonth = destDate.getDate();
            newMonthlyRules = [{
              id: uuidv4(),
              value: 'fixed',
              ruleValue: dayOfMonth
            }];
            newMonthlyDaySpecificity = 'specific';
          } else {
            // Moving from one day to another
            const sourceDate = parse(sourceId, 'yyyy-MM-dd', new Date());
            const sourceDayOfMonth = sourceDate.getDate();
            const sourceDayOfWeek = format(sourceDate, 'EEEE');
            const sourceWeekOfMonth = Math.ceil(sourceDayOfMonth / 7);
          
            const destDate = parse(destId, 'yyyy-MM-dd', new Date());
            const destDayOfMonth = destDate.getDate();
            const destDayOfWeek = format(destDate, 'EEEE');
            const destWeekOfMonth = Math.ceil(destDayOfMonth / 7);
          
            // Determine which rule to modify based on order of precedence: fixed -> ordinal -> specific
            let ruleToModify;
            let newRuleValue;
          
            // Check for fixed rule first
            const existingFixedRule = newMonthlyRules.find(rule => 
              rule.value === 'fixed' && rule.ruleValue === sourceDayOfMonth
            );
            if (existingFixedRule) {
              ruleToModify = existingFixedRule;
              newRuleValue = destDayOfMonth;
            } else {
              // If no fixed rule, check for ordinal rule
              const existingOrdinalRule = newMonthlyRules.find(rule => 
                rule.value === 'ordinal' && 
                rule.ruleValue[0] === sourceWeekOfMonth.toString() && 
                rule.ruleValue[1] === format(sourceDate, 'EEE')
              );
              if (existingOrdinalRule) {
                ruleToModify = existingOrdinalRule;
                newRuleValue = [destWeekOfMonth.toString(), format(destDate, 'EEE')];
              } else {
                // If no ordinal rule, check for specific day rule
                const existingSpecificRule = newMonthlyRules.find(rule => 
                  rule.value === 'specific' && 
                  action.selectedDays.includes(sourceDayOfWeek)
                );
                if (existingSpecificRule) {
                  ruleToModify = existingSpecificRule;
                  // Update the selected days for the specific rule
                  newSelectedDays = action.selectedDays.filter(day => day !== sourceDayOfWeek).concat(destDayOfWeek);
                }
              }
            }
          
            // If we found a rule to modify, update it
            if (ruleToModify) {
              if (ruleToModify.value === 'specific') {
                // For specific rule, we update the selectedDays
                newWeekDaySpecificity = 'specific';
                newSelectedDays = [destDayOfWeek];
              } else {
                // For fixed or ordinal rules, we update the ruleValue
                ruleToModify.ruleValue = newRuleValue;
              }
            } else {
              // If no existing rule was found, create a new fixed rule
              newMonthlyRules.push({
                id: uuidv4(),
                value: 'fixed',
                ruleValue: destDayOfMonth
              });
            }
          }
        }
  
        return {
          ...action,
          monthlyRules: removeDuplicateRules(newMonthlyRules),
          monthlyDaySpecificity: newMonthlyDaySpecificity,
          weekDaySpecificity: newWeekDaySpecificity,
          selectedDays: newSelectedDays
        };
      }

      return action;
    });
  
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  };
  const renderWeeklyScheduler = () => {
    const weekStart = startOfWeek(weeklySchedulerselectedDay);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="mt-6 relative">
        <div className="freqPeriodSchedulerTitle flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Weekly Scheduler</h2>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWeeklySchedulerMinimize(); }}
            className="w-6 h-6 flex items-center justify-center dimension-theme-colored"
          >
            {isWeeklySchedulerMinimized ? '+' : '-'}
          </button>
        </div>
        <div className='weeklyScheduler'>
          <div className="flex">
            <button
              className={`px-4 py-2 ${weeklySchedulercurrentView === 'day' ? 'dimension-theme-colored' : 'bg-gray-200'} rounded-tl rounded-tr`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWeeklySchedulerCurrentView('day');}}
            >
              Day
            </button>
            <button
              className={`px-4 py-2 ${weeklySchedulercurrentView === 'week' ? 'dimension-theme-colored' : 'bg-gray-200'} rounded-tl rounded-tr ml-2`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWeeklySchedulerCurrentView('week');}}
            >
              Week
            </button>
          </div>
          
          <div className="border border-gray-300 p-4 rounded">
            {weeklySchedulercurrentView === 'day' ? (
              <DayView 
                day={weeklySchedulerselectedDay} 
                events={dynamicEvents}
                anyTimeEvents={anyTimeEvents}
                onDayChange={setWeeklySchedulerSelectedDay}
              />
            ) : (
              <WeekView 
                days={days} 
                events={dynamicEvents} 
                anyTimeEvents={anyTimeEvents}
                onEventMove={onEventMoveWeekView }
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const [monthlySchedulercurrentView, setMonthlySchedulerCurrentView] = useState('month');
  const [monthlySchedulerselectedDay, setMonthlySchedulerSelectedDay] = useState(new Date());
  const [isMonthlySchedulerMinimized, setIsMonthlySchedulerMinimized] = useState(false);
  const toggleMonthlySchedulerMinimize = () => {
    setIsMonthlySchedulerMinimized(!isMonthlySchedulerMinimized)
    setIsWeeklySchedulerMinimized(!isMonthlySchedulerMinimized);
    setIsDailySchedulerMinimized(!isMonthlySchedulerMinimized);
    if (!isMonthlySchedulerMinimized) {
      // Clear selected events when minimizing
      setSelectedEvents([]);
    }
  };

  const renderMonthlyScheduler = () => {
    const weekStart = startOfWeek(monthlySchedulerselectedDay);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const monthStart = startOfMonth(monthlySchedulerselectedDay);
    return (
      <div className="mt-6 relative">
        <div className="freqPeriodSchedulerTitle flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Monthly Scheduler</h2>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMonthlySchedulerMinimize(); }}
            className="w-6 h-6 flex items-center justify-center dimension-theme-colored"
          >
            {isMonthlySchedulerMinimized ? '+' : '-'}
          </button>
        </div>
        <div className='monthlyScheduler'>
          <div className="flex">
            <button
              className={`px-4 py-2 ${monthlySchedulercurrentView === 'day' ? 'dimension-theme-colored' : 'bg-gray-200'} rounded-tl rounded-tr`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMonthlySchedulerCurrentView('day');}}
            >
              Day
            </button>
            <button
              className={`px-4 py-2 ${monthlySchedulercurrentView === 'week' ? 'dimension-theme-colored' : 'bg-gray-200'} rounded-tl rounded-tr ml-2`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMonthlySchedulerCurrentView('week');}}
            >
              Week
            </button>
            <button
              className={`px-4 py-2 ${monthlySchedulercurrentView === 'month' ? 'dimension-theme-colored' : 'bg-gray-200'} rounded-tl rounded-tr ml-2`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMonthlySchedulerCurrentView('month');}}
            >
              Month
            </button>
          </div>
          
          <div className="border border-gray-300 p-4 rounded">
            {monthlySchedulercurrentView === 'day' && (
              <DayView 
                day={monthlySchedulerselectedDay} 
                events={dynamicEvents}
                anyTimeEvents={anyTimeEvents}
                onDayChange={setMonthlySchedulerSelectedDay}
              />
            )}
            {monthlySchedulercurrentView === 'week' && (
              <WeekView 
                days={weekDays} 
                events={dynamicEvents} 
                anyTimeEvents={anyTimeEvents}
                onEventMove={onEventMoveWeekView }
              />
            )}
            {monthlySchedulercurrentView === 'month' && (
              <MonthView
                monthStart={monthStart} 
                events={dynamicEvents} 
                anyTimeEvents={anyTimeEvents}
                onEventMove={onEventMoveMonthView}
                isMinimized={isMonthlySchedulerMinimized}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const DayView = ({ day, events, anyTimeEvents, onDayChange }) => {
    let selectionBoxYOffset = 0;
    let selectionBoxXOffset = 0;


    
    if(dayViewRegularScheduleRef.current ){
      selectionBoxYOffset = dayViewRegularScheduleRef.current.parentNode.parentNode.getBoundingClientRect().top - dayViewRegularScheduleRef.current.getBoundingClientRect().top;
      const freqPeriodSchedulerTitle = document.querySelector('.freqPeriodSchedulerTitle');
      const weeklyScheduler = document.querySelector('.weeklyScheduler');
      if (freqPeriodSchedulerTitle && localHabitData.habit_frequencyPeriod == 'daily') {
        const styles = window.getComputedStyle(freqPeriodSchedulerTitle);
        const marginTop = parseFloat(styles.marginTop);
        const marginBottom = parseFloat(styles.marginBottom);
        const height = freqPeriodSchedulerTitle.getBoundingClientRect().height;
        const totalHeight = height + marginTop + marginBottom;
        selectionBoxYOffset -= totalHeight;
      }
      else if(weeklyScheduler && localHabitData.habit_frequencyPeriod == 'weekly'){
        //hard coded, needs to be updated if padding changes
        selectionBoxXOffset += 16;
      
        const height = dayViewSchedulerRef.current.getBoundingClientRect().top - weeklyScheduler.getBoundingClientRect().top;
        selectionBoxYOffset -= height - 4;
      }
    }

    // Filter events based on frequency period and selected days
    let filteredEvents = events;
    let filteredAnyTimeEvents = anyTimeEvents;
    if(localHabitData.habit_frequencyPeriod == 'weekly'){
      filteredEvents.filter(event => 
        event.weekDaySpecificity === 'any' || 
        (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')))
      )
      filteredAnyTimeEvents.filter(event => 
        event.weekDaySpecificity === 'any' || 
        (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')))
      )
    } else if(localHabitData.habit_frequencyPeriod == 'monthly'){
      filteredEvents = events.filter(event => 
        event.monthlyDaySpecificity === 'any' || 
        event.monthlyDaySpecificity === 'specific' && event.monthlyRules.length == 0 ||
        (event.monthlyDaySpecificity === 'specific' && event.monthlyRules.some(rule => {
          const dayOfMonth = day.getDate();
          const dayOfWeek = format(day, 'EEE');
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
          switch(rule.value) {
            case 'fixed':
              return dayOfMonth === rule.ruleValue || 
                    (dayOfMonth === getLastDayOfMonth(day) && dayOfMonth < rule.ruleValue && rule.ruleValue >= 29);
            case 'ordinal':
              const [nthOccurrence, targetDayOfWeek] = rule.ruleValue;
              return isNthDayOfMonth(day, parseInt(nthOccurrence), targetDayOfWeek);
            case 'specific':
              return event.weekDaySpecificity === 'any' || 
                     (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')));
            default:
              return false;
          }
        }))
      );
    
      filteredAnyTimeEvents = anyTimeEvents.filter(event => 
        event.monthlyDaySpecificity === 'any' ||
        event.monthlyDaySpecificity === 'specific' && event.monthlyRules.length == 0 || 
        (event.monthlyDaySpecificity === 'specific' && event.monthlyRules.some(rule => {
          const dayOfMonth = day.getDate();
          const dayOfWeek = format(day, 'EEE');
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
          switch(rule.value) {
            case 'fixed':
              return dayOfMonth === rule.ruleValue || 
                    (dayOfMonth === getLastDayOfMonth(day) && dayOfMonth < rule.ruleValue && rule.ruleValue >= 29);
            case 'ordinal':
              const [nthOccurrence, targetDayOfWeek] = rule.ruleValue;
              return isNthDayOfMonth(day, parseInt(nthOccurrence), targetDayOfWeek);
            case 'specific':
              return event.weekDaySpecificity === 'any' || 
                     (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')));
            default:
              return false;
          }
        }))
      );
    }

    const renderMinimizedEvents = () => {
      // Sort events chronologically
      const sortedEvents = [...filteredEvents].sort((a, b) => {
        const startA = getMinutesFromMidnight(a.startTime);
        const startB = getMinutesFromMidnight(b.startTime);
        return startA - startB;
      });
    
      return (
        <div className="relative " style={{ height: 'auto'}}>
          {sortedEvents.map((event) => {
            const start = getMinutesFromMidnight(event.startTime);
            const end = getMinutesFromMidnight(event.endTime);
            const duration = (end - start + MINUTES_IN_DAY) % MINUTES_IN_DAY;
            const height = (duration / MINUTES_IN_SCHEDULER) * (HOUR_HEIGHT * 24);
            const actionIndex = getActionIndex(event.id);
    
            const style = {
              position: 'relative',
              height: `${Math.max(height, 20)}px`,
              marginBottom: '10px',
              cursor: 'pointer',
            };
    
            const backgroundColor = globalActionColor;
            const isLight = isColorLight(backgroundColor);
            const textColor = isLight ? 'black' : 'white';
    
            return (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`text-xs p-1 rounded event-item ${
                  selectedEvents.includes(event.id) ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                } ${draggedEvents?.some(e => e.id === event.id) ? 'opacity-75' : ''}`}
                style={{
                  ...style,
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow truncate">
                    {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                      ? `${localHabitData.habit_action} #${actionIndex + 1}`
                      : `Action #${actionIndex + 1}`
                    }
                  </div>
                  <div className="flex-shrink-0 ml-1">
                    ({formatTime(event.startTime)} - {formatTime(event.endTime)})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    };
  
    const renderNormalEvents = () => {
      return (
        <>
          {/* Hour labels */}
          <div className="absolute top-0 bottom-0 left-0" style={{ width: `${HOUR_LABEL_WIDTH}px`, borderRight: '1px solid #e5e7eb' }}>
            {Array.from({ length: 25 }, (_, hour) => (
              <div key={hour} className="absolute w-full flex items-center justify-end pr-2 font-bold text-sm" 
                   style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                {formatHourLabels(hour)}
              </div>
            ))}
          </div>
          <div 
            className="absolute top-0 right-0 bottom-0" 
            style={{ left: `${HOUR_LABEL_WIDTH}px` }}
          >
            {/* Hour lines */}
            {Array.from({ length: 25 }, (_, hour) => (
              <div key={hour} className="absolute w-full border-b border-gray-200 last:border-b-0" 
                   style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
              </div>
            ))}
            {/* Event blocks */}
            {filteredEvents.map((event) => {
              const actionIndex = getActionIndex(event.id);
              let start = getMinutesFromMidnight(event.startTime);
              let end = getMinutesFromMidnight(event.endTime);
              let duration = end - start;
              if (duration <= 0) duration += MINUTES_IN_DAY;
              const height = (duration / MINUTES_IN_SCHEDULER) * (HOUR_HEIGHT * 24);
  
              const columnWidth = event.isOverlapping ? 100 / (event.maxColumn + 1) : 100;
  
              const style = {
                position: 'absolute',
                top: `${(start / MINUTES_IN_SCHEDULER) * 100}%`,
                height: `${Math.max(height, 20)}px`,
                left: event.isOverlapping ? `${event.column * columnWidth}%` : '0%',
                width: `${columnWidth}%`,
                zIndex: draggedEvents?.some(e => e.id === event.id) ? 1000 : 'auto',
              };
  
              const isSelected = selectedEvents.includes(event.id);
              const backgroundColor = globalActionColor;
              const isLight = isColorLight(backgroundColor);
              const borderColor = isSelected 
                ? (isLight ? darkenColor(backgroundColor, 50) : lightenColor(backgroundColor, 50))
                : 'transparent';
              const textColor = isLight ? 'black' : 'white';
              
              return (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={`event-item text-xs p-1 rounded cursor-move 
                    ${draggedEvents?.some(e => e.id === event.id) ? 'opacity-75' : ''}
                    focus:outline-none`}
                  style={{
                    ...style,
                    backgroundColor: backgroundColor,
                    color: textColor,
                    border: isSelected ? `2px solid ${borderColor}` : 'none',
                    boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : 'none',
                  }}
                >
                <div className="flex justify-between items-center">
                  <div className="flex-grow truncate">
                    {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                      ? `${localHabitData.habit_action} #${actionIndex + 1}`
                      : `Action #${actionIndex + 1}`
                    }
                  </div>
                  <div className="flex-shrink-0 ml-1">
                    ({formatTime(event.startTime)} - {formatTime(event.endTime)})
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      );
    };
  
    const renderAnyTimeEvents = () => {
      return (
        <div 
          className="absolute right-0 bottom-0 overflow-x-auto"
          style={{ left: isDailySchedulerMinimized ? '0' : `${HOUR_LABEL_WIDTH}px`, height: '100px',}}
        >
          <div className="flex items-center h-full">
            {filteredAnyTimeEvents.map((event) => {
              const actionIndex = getActionIndex(event.id);
              const isSelected = selectedEvents.includes(event.id);
              const backgroundColor = globalActionColor;
              const isLight = isColorLight(backgroundColor);
              const borderColor = isSelected 
                ? (isLight ? darkenColor(backgroundColor, 50) : lightenColor(backgroundColor, 50))
                : 'transparent';
              const textColor = isLight ? 'black' : 'white';
              
              return (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={`event-item text-xs p-1 rounded mx-1 
                    ${draggedEvents?.some(e => e.id === event.id) ? 'opacity-75' : ''}
                    ${isDailySchedulerMinimized ? 'cursor-pointer' : (isMobile ? 'cursor-pointer' : 'cursor-move')}
                    focus:outline-none`}
                  style={{
                    width: '110px',
                    height: '60px',
                    flexShrink: 0,
                    backgroundColor: backgroundColor,
                    color: textColor,
                    border: isSelected ? `2px solid ${borderColor}` : 'none',
                    boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : 'none',
                  }}
                  onClick={() => isMobile && handleAnyTimeEventClick(event)}
                >
                  <div className="flex items-center">
                    <div className="flex-grow truncate">
                      {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                        ? localHabitData.habit_action
                        : 'Action'
                      }
                    </div>
                    <div className="flex-shrink-0 ml-1">
                      #{actionIndex + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    return (
      <div className="day-view">
        {(localHabitData.habit_frequencyPeriod === 'weekly' || localHabitData.habit_frequencyPeriod === 'monthly') && (
          <div className="dayChanger flex justify-between items-center mb-4">
            <button
              className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}         
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); 
                onDayChange(addDays(day, -1));
              }}
              >&lt; Previous Day
            </button>
            <h3 className='font-bold text-center'>
              {localHabitData.habit_frequencyPeriod === 'weekly' 
                ? format(day, 'EEEE') 
                : `${format(day, 'EEEE')} ${format(day, 'MMM. d')}`
              }
            </h3>
            <button
              className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}             
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); 
                onDayChange(addDays(day, 1));
              }}
              >Next Day &gt;
            </button>
          </div>
        )}
        <div 
          ref={dayViewSchedulerRef}
          className="scheduler flex flex-col space-y-4 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging && !isDailySchedulerMinimized ? 'move' : 'default'}}
        >
          {/* Any Time section */}
          {(!isDailySchedulerMinimized || (isDailySchedulerMinimized && anyTimeEvents.length > 0)) && (
            <div className="border border-gray-300 rounded relative">
              {isDailySchedulerMinimized && (
                <h4 className="text-md font-bold p-2 bg-gray-100 border-b border-gray-300">
                  Any Time Actions
                </h4>
              )}
              <div style={{ height: `${ANY_TIME_HEIGHT}px` }}>
                {!isDailySchedulerMinimized && (
                  <div className="absolute top-0 bottom-0 left-0 w-full flex items-center justify-start pl-2 font-bold text-sm border-r border-gray-200" 
                      style={{ width: `${HOUR_LABEL_WIDTH}px` }}>
                    Any Time
                  </div>
                )}
                {renderAnyTimeEvents()}
              </div>
            </div>
          )}
          {/* Regular schedule */}
          <div 
            ref={dayViewRegularScheduleRef}
            className="dailyScheduler border border-gray-300 rounded relative" 
            style={{ height: isDailySchedulerMinimized ? 'auto' : `${HOUR_HEIGHT * 25}px` }}
          >
            {isDailySchedulerMinimized && events.length > 0 && (
              <h4 className="text-md font-bold p-2 bg-gray-100 border-b border-gray-300">
                Time Scheduled Actions
              </h4>
            )}
            {isDailySchedulerMinimized ? renderMinimizedEvents() : renderNormalEvents()}
          </div>
        </div>
        {/* Drag Indicator, currently disabled, rendering needs to be reworked */}
        {/* {dragIndicator && !dragIndicator.isAnyTime && (
          <div 
            className="absolute bg-gray-300 opacity-50 pointer-events-none"
            style={{
              top: `${ANY_TIME_HEIGHT + SECTION_GAP + dragIndicator.height + dragIndicator.top + 3}px`,
              height: `${dragIndicator.height}px`,
              left: `${HOUR_LABEL_WIDTH}px`,
              right: '0px',
              zIndex: 10,
            }}
          />
        )} */}
        
        {/* Selection Box */}
        {/* {console.log(selectionBox)} */}
        {selectionBox && (
          <div 
            className="absolute bg-blue-200 opacity-50 z-50"
            style={{
              top: `${Math.min(selectionBox.startY - selectionBoxYOffset, selectionBox.endY - selectionBoxYOffset)}px`,
              left: `${Math.min(selectionBox.startX + selectionBoxXOffset, selectionBox.endX + selectionBoxXOffset)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  };

  const WeekView = ({ days, events, anyTimeEvents, onEventMove}) => {
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [originalDay, setOriginalDay] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(days[0]));
  
    const getDayEvents = (day) => {
      if (localHabitData.habit_frequencyPeriod === 'weekly') {
        const scheduledEvents = events.filter(event => {
          if (event.weekDaySpecificity === 'any') return false;
          if (event.weekDaySpecificity === 'specific' && event.selectedDays) {
            return event.selectedDays.includes(format(day, 'EEEE'));
          }
          return format(parse(event.startTime, 'HH:mm', day), 'EEEE') === format(day, 'EEEE');
        });
    
        const anyTimeEventsForDay = anyTimeEvents.filter(event => {
          if (event.weekDaySpecificity === 'any') return false;
          if (event.weekDaySpecificity === 'specific' && event.selectedDays) {
            return event.selectedDays.includes(format(day, 'EEEE'));
          }
          return false;
        });
    
        return [...scheduledEvents, ...anyTimeEventsForDay];
      } else if (localHabitData.habit_frequencyPeriod === 'monthly') {
        const filterMonthlyEvent = (event) => {
          if (event.monthlyDaySpecificity === 'specific' && event.monthlyRules) {
            return event.monthlyRules.some(rule => {
              const dayOfMonth = day.getDate();
              const dayOfWeek = format(day, 'EEE');
              const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
              switch(rule.value) {
                case 'fixed':
                  return dayOfMonth === rule.ruleValue || 
                    (dayOfMonth === getLastDayOfMonth(day) && dayOfMonth < rule.ruleValue && rule.ruleValue >= 29);
                case 'ordinal':
                  const [nthOccurrence, targetDayOfWeek] = rule.ruleValue;
                  return isNthDayOfMonth(day, parseInt(nthOccurrence), targetDayOfWeek);
                case 'specific':
                  return event.weekDaySpecificity === 'any' || 
                         (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')));
                default:
                  return false;
              }
            });
          }
          return false;
        };
    
        const scheduledEvents = events.filter(filterMonthlyEvent);
        const anyTimeEventsForDay = anyTimeEvents.filter(filterMonthlyEvent);
    
        return [...scheduledEvents, ...anyTimeEventsForDay];
      }
    
      return [];
    };
    
    const getAnyDayEvents = () => {
      if (localHabitData.habit_frequencyPeriod === 'weekly') {
        return [...anyTimeEvents, ...events].filter(event => event.weekDaySpecificity === 'any');
      } else if (localHabitData.habit_frequencyPeriod === 'monthly') {
        return [...anyTimeEvents, ...events].filter(event => event.monthlyDaySpecificity === 'any' || event.monthlyRules.length === 0);
      }
      return [];
    };
  
    const onDragStart = (result) => {
      const { source } = result;
      const eventId = result.draggableId;
      const sourceId = source.droppableId;
  
      const event = events.find(e => e.id === eventId);
      if (event) {
        setDraggedEvent(event);
        setOriginalDay(sourceId);
      }
    };
  
    const onDragEnd = (result) => {
      const { source, destination } = result;
      if (!destination) return;
  
      const sourceId = source.droppableId;
      const destId = destination.droppableId;
  
      if (sourceId !== destId) {
        const eventId = result.draggableId;
        onEventMove(eventId, sourceId, destId);
  
        if (draggedEvent) {
          setDraggedEvent(null);
          setOriginalDay(null);
        }
      }
    };
  
    const renderEvent = (event, index, isAnyDay = false, dayOfEvent) => {
      const actionIndex = scheduleActions.findIndex(action => action.id === event.id);
      const isSelected = selectedEvents.includes(event.id);
      const backgroundColor = globalActionColor;
      const isLight = isColorLight(backgroundColor);
      const borderColor = isSelected 
        ? (isLight ? darkenColor(backgroundColor, 50) : lightenColor(backgroundColor, 50))
        : 'transparent';
    
      const handleEventClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEvents([event.id]);
      };
    
      return (
        <Draggable key={isAnyDay ? event.id : event.id + dayOfEvent} draggableId={isAnyDay ? event.id : event.id + dayOfEvent} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`event-item p-2 rounded shadow overflow-hidden ${isAnyDay ? '' : 'mb-1 text-xs'}`}
              style={{
                ...provided.draggableProps.style,
                backgroundColor: globalActionColor,
                color: isColorLight(globalActionColor) ? 'black' : 'white',
                minHeight: '50px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                border: isSelected ? `5px solid ${borderColor}` : 'none',
                boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : 'none',
              }}
              onClick={handleEventClick}
            >
              {isAnyDay ? (
                <div className="flex items-center w-full">
                  <div className="flex-grow truncate">
                    {localHabitData.habit_action && localHabitData.habit_action.length > 0
                      ? localHabitData.habit_action
                      : 'Action'
                    }
                  </div>
                  <div className="flex-shrink-0 ml-1">
                    #{actionIndex + 1}
                  </div>
                </div>
              ) : (
                <>
                  {!isMobile && (
                    <div className="truncate text-center w-full mb-1">
                      {localHabitData.habit_action && localHabitData.habit_action.length > 0
                        ? localHabitData.habit_action
                        : 'Action'
                      }
                    </div>
                  )}
                  <div className="text-center w-full">
                    #{actionIndex + 1}
                  </div>
                </>
              )}
            </div>
          )}
        </Draggable>
      );
    };
  
    const handlePreviousWeek = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newWeekStart = subWeeks(currentWeekStart, 1);
      setCurrentWeekStart(newWeekStart);
      setMonthlySchedulerSelectedDay(newWeekStart);
    };
  
    const handleNextWeek = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newWeekStart = addWeeks(currentWeekStart, 1);
      setCurrentWeekStart(newWeekStart);
      setMonthlySchedulerSelectedDay(newWeekStart);
    };
  
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
    const renderWeekHeader = () => {
      if (localHabitData.habit_frequencyPeriod !== 'monthly') return null;
  
      const weekEnd = addDays(currentWeekStart, 6);
      return (
        <div className="flex justify-between items-center mb-4">
          <button
            onMouseDown={handlePreviousWeek}
            className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}
          >
            &lt; Previous Week
          </button>
          <h3 className="font-bold text-center">
            {format(currentWeekStart, 'MMM. d')} - {format(weekEnd, 'MMM. d')}
          </h3>
          <button
            onMouseDown={handleNextWeek}
            className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}
          >
            Next Week &gt;
          </button>
        </div>
      );
    };
  
    const renderDayHeader = (day) => (
      <button
        className="font-semibold text-center sticky top-0 bg-white py-2 underline w-full text-left"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (localHabitData.habit_frequencyPeriod === 'monthly') {
            setMonthlySchedulerCurrentView('day');
            setMonthlySchedulerSelectedDay(day);
          } else {
            setWeeklySchedulerCurrentView('day');
            setWeeklySchedulerSelectedDay(day);
          }
        }}
      >
        <div>{format(day, 'EEE')}</div>
        {localHabitData.habit_frequencyPeriod === 'monthly' && (
          <div className="text-sm">{format(day, 'M/d')}</div>
        )}
      </button>
    );
  
    const renderMaximizedView = () => {
      return (
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="week-view flex flex-col h-[600px] rounded">
            {renderWeekHeader()}
            <h4 className="font-bold mb-2 flex justify-center underline">Any Day</h4>
            <Droppable droppableId="any-day" direction="horizontal">
              {(provided, snapshot) => (
                <div 
                  className={`any-day-section mb-4 border border-gray-300 rounded p-1 ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`} 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  style={{
                    minHeight: '60px',
                  }}
                >
                  <div className="overflow-x-auto whitespace-nowrap">
                    <div className="flex space-x-2">
                      {getAnyDayEvents().map((event, index) => renderEvent(event, index, true))}
                      {provided.placeholder}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
  
            <div className="days-container grid grid-cols-7 flex-1 overflow-hidden">
              {weekDays.map(day => (
                <div key={format(day, 'EEEE')} className="day-column">
                  {renderDayHeader(day)}
                  <Droppable droppableId={format(day, 'EEEE')}>
                    {(provided, snapshot) => (
                      <div 
                        className={`day-section border border-gray-300 rounded p-1 ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div
                          className={`overflow-y-auto overflow-x-hidden h-[calc(100%-2rem)]`}
                          style={{
                            minHeight: '69px',
                          }}
                        >
                          {getDayEvents(day).map((event, index) => renderEvent(event, index, false, format(day, 'EEE')))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      );
    };
  
    const renderMinimizedView = () => {
      return (
        <div className="week-view flex flex-col h-[600px] rounded">
          {renderWeekHeader()}
          <h4 className="font-bold mb-2 flex justify-center underline">Any Day</h4>
          <div className="any-day-section mb-4 border border-gray-300 rounded p-1" style={{ minHeight: '60px' }}>
            <div className="overflow-x-auto whitespace-nowrap">
              <div className="flex">
                {renderMinimizedEventBlock(getAnyDayEvents().length, true)}
              </div>
            </div>
          </div>
    
          <div className="days-container grid grid-cols-7 flex-1 overflow-hidden">
            {weekDays.map(day => (
              <div key={format(day, 'EEEE')} className="day-column">
                {renderDayHeader(day)}
                <div className="day-section border border-gray-300 rounded p-1">
                  <div
                    className="overflow-y-auto overflow-x-hidden h-[calc(100%-2rem)]"
                    style={{ minHeight: '69px' }}
                  >
                    {renderMinimizedEventBlock(getDayEvents(day).length, false)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    const renderMinimizedEventBlock = (count, isAnyDay) => {
      if (count === 0) return null;
    
      const handleEventClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // You might want to implement a way to select all events in this block
        // or just indicate that this day/section is selected
      };
    
      return (
        <div
          className={`event-item p-2 rounded shadow overflow-hidden ${isAnyDay ? '' : 'mb-1 text-xs'}`}
          style={{
            backgroundColor: globalActionColor,
            color: isColorLight(globalActionColor) ? 'black' : 'white',
            minHeight: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: '100%'
          }}
          onClick={handleEventClick}
        >
          <div className="text-center w-full">
          {count} {localHabitData.habit_action && localHabitData.habit_action.length > 0 ? localHabitData.habit_action + ' ' : ''}{count === 1 ? 'Action' : 'Actions'} 
          </div>
        </div>
      );
    };
  
    return isWeeklySchedulerMinimized ? renderMinimizedView() : renderMaximizedView();
  };

  const MonthView = ({ monthStart, events, anyTimeEvents, onEventMove, isMinimized }) => {
    const [currentMonth, setCurrentMonth] = useState(monthStart);
    const [calendarDays, setCalendarDays] = useState([]);
    useEffect(() => {
      const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
      setCalendarDays(eachDayOfInterval({ start, end }));
    }, [currentMonth]);

    const [monthDays, setMonthDays] = useState([]);
    useEffect(() => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      setMonthDays(eachDayOfInterval({ start, end }));
    }, [currentMonth]);

    const getAnyDayEvents = () => {
        return [...anyTimeEvents, ...events].filter(event => event.monthlyDaySpecificity === 'any' || event.monthlyRules.length === 0);
      }

    const getDayEvents = (day) => {
        const filterMonthlyEvent = (event) => {
          if (event.monthlyDaySpecificity === 'specific' && event.monthlyRules) {
            return event.monthlyRules.some(rule => {
              const dayOfMonth = day.getDate();
              const dayOfWeek = format(day, 'EEE');
              const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
              switch(rule.value) {
                case 'fixed':
                  return dayOfMonth === rule.ruleValue || 
                    (dayOfMonth === getLastDayOfMonth(day) && dayOfMonth < rule.ruleValue && rule.ruleValue >= 29);
                case 'ordinal':
                  const [nthOccurrence, targetDayOfWeek] = rule.ruleValue;
                  return isNthDayOfMonth(day, parseInt(nthOccurrence), targetDayOfWeek);
                case 'specific':
                  return event.weekDaySpecificity === 'any' || 
                          (event.selectedDays && event.selectedDays.includes(format(day, 'EEEE')));
                default:
                  return false;
              }
            });
          }
          return false;
        };
    
        const scheduledEvents = events.filter(filterMonthlyEvent);
        const anyTimeEventsForDay = anyTimeEvents.filter(filterMonthlyEvent);
    
        return [...scheduledEvents, ...anyTimeEventsForDay];
      
    };
  
    const handlePreviousMonth = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentMonth(subMonths(currentMonth, 1));
    };
  
    const handleNextMonth = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentMonth(addMonths(currentMonth, 1));
    };
  
    const renderEvent = (event, index, isAnyDay = false, dayOfEvent) => {
      const actionIndex = scheduleActions.findIndex(action => action.id === event.id);
      const isSelected = selectedEvents.includes(event.id);
      const backgroundColor = globalActionColor;
      const isLight = isColorLight(backgroundColor);
      const borderColor = isSelected 
        ? (isLight ? darkenColor(backgroundColor, 50) : lightenColor(backgroundColor, 50))
        : 'transparent';
    
      const handleEventClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEvents([event.id]);
      };
    
      return (
        <Draggable key={isAnyDay ? event.id : event.id + dayOfEvent} draggableId={isAnyDay ? event.id : event.id + dayOfEvent} index={index}>
          {(provided) => (
            isAnyDay ? (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`event-item p-2 rounded shadow overflow-hidden ${isAnyDay ? '' : 'mb-1 text-xs'}`}
                style={{
                  ...provided.draggableProps.style,
                  backgroundColor: globalActionColor,
                  color: isColorLight(globalActionColor) ? 'black' : 'white',
                  minHeight: '50px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: isSelected ? `5px solid ${borderColor}` : 'none',
                  boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : 'none',
                }}
                onClick={handleEventClick}
              >
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0 ml-1">
                    #{actionIndex + 1}
                  </div>
                </div>
              </div>
            ) : (
              <div              
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps} 
                className="event-item p-1 mb-1 text-xs rounded text-center w-full"
                style={{
                  ...provided.draggableProps.style,
                  backgroundColor: globalActionColor,
                  color: isColorLight(globalActionColor) ? 'black' : 'white', 
                  border: isSelected ? `5px solid ${borderColor}` : 'none',
                  boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : 'none',
                  cursor: 'pointer' 
                }}
                onClick={handleEventClick}
              >
                #{actionIndex + 1}
              </div>
            )
          )}
        </Draggable>
      );
    };
  
    const renderDay = (day) => {
      const dayEvents = getDayEvents(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const blockStyle = {
        backgroundColor: globalActionColor,
        color: isColorLight(globalActionColor) ? 'black' : 'white',
        cursor: 'pointer',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      };
    
      const handleDayNumClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMonthlySchedulerSelectedDay(day);
        setMonthlySchedulerCurrentView('day');
      };

      const handleDayClick = (e) => {
      
        if (e.target.closest('.event-item') || e.target.closest('.day-number')) {
          return;
        }
        // Add a small delay before clearing selection
        setTimeout(() => {
          setSelectedEvents([]);
        }, 100);
      };
    
      return (
        <Droppable droppableId={format(day, 'yyyy-MM-dd')}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col h-full"
              onClick={handleDayClick}
            >
              <div className={`day-cell border p-1 h-24 overflow-hidden ${
                isCurrentMonth ? (snapshot.isDraggingOver ? 'bg-gray-200' : 'bg-white') : 'bg-gray-100'
              }`}>
                <div onClick={handleDayNumClick} className={`day-number text-right ${isCurrentMonth ? 'text-black' : 'text-gray-400'} mb-1 cursor-pointer`}>
                  {format(day, 'd')}
                </div>
                <div className="flex-grow overflow-y-auto">
                  {dayEvents.length > 0 ? (
                    dayEvents.length > 2 ? (
                      <Draggable key={dayEvents[0].id + day} draggableId={dayEvents[0].id + day} index={0}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`text-${isMobile ? 'lg' : 'xs'} event-item p-2 rounded shadow overflow-hidden text-center w-full`}
                            style={{...blockStyle, ...provided.draggableProps.style}}
                          >
                            {isMobile ? '⋮' : `${dayEvents.length} Actions`}
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      dayEvents.map((event, index) => renderEvent(event, index, false, day))
                    )
                  ) : (
                    <Draggable key={`empty-${format(day, 'yyyy-MM-dd')}`} draggableId={`empty-${format(day, 'yyyy-MM-dd')}`} index={0}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            height: 0,
                            padding: 0,
                            margin: 0,
                            border: 'none',
                            background: 'transparent',
                          }}
                        />
                      )}
                    </Draggable>
                  )}
                  {provided.placeholder}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      );
    };
  
    const renderMinimizedView = () => {
      const weeks = [];
      let currentWeek = [];
      monthDays.forEach((day, index) => {
        if (index === 0 || getDay(day) === 0) {
          if (currentWeek.length > 0) {
            weeks.push(currentWeek);
          }
          currentWeek = [day];
        } else {
          currentWeek.push(day);
        }
      });
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
  
      return (
        <div className="minimized-month-view">
          <div className="week-row border p-2 mb-2">
            <div className="font-bold">Any Day</div>
            <div className="event-count">
            {renderMinimizedEventBlock(getAnyDayEvents().length, true)}
            </div>
          </div>
          {weeks.map((week, weekIndex) => {
            const weekStart = format(week[0], 'M/d');
            const weekEnd = format(week[week.length - 1], 'M/d');
            return (
              <div key={weekIndex} className="week-row border p-2 mb-2">
                <div className="font-bold">Week {weekIndex + 1}, {weekStart} - {weekEnd}</div>
                <div className="event-count">
                  {renderMinimizedEventBlock(week.reduce((total, day) => total + getDayEvents(day).length, 0), false)}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderMinimizedEventBlock = (count, isAnyDay) => {
      if (count === 0) {
        return (
          <div
            className={`event-item p-2 rounded overflow-hidden text-xs ${isAnyDay  ? '' : 'mb-1'}`}
            style={{
              color: 'black',
              backgroundColor: 'transparent',
              minHeight: '50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'default',
              width: '100%'
            }}
          >
            <div className="text-center w-full italic">
              No Actions Scheduled for this Period
            </div>
          </div>
        );
      }
    
      return (
        <div
          className={`event-item p-2 rounded shadow overflow-hidden ${isAnyDay ? '' : 'mb-1 text-xs'}`}
          style={{
            backgroundColor: globalActionColor,
            color: isColorLight(globalActionColor) ? 'black' : 'white',
            minHeight: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          <div className="text-center w-full">
          {count} {localHabitData.habit_action && localHabitData.habit_action.length > 0 ? localHabitData.habit_action + ' ' : ''}{count === 1 ? 'Action' : 'Actions'} 
          </div>
        </div>
      );
    };
  
    const renderMaximizedView = () => {
      const [anyDayisDraggingOver, setAnyDayIsDraggingOver] = useState([]);
      const handleMonthViewClick = (e) => {
      
        if (e.target.closest('.event-item') || e.target.closest('.day-number') || e.target.closest('button')) {
          return;
        }
      
        // Add a small delay before clearing selection
        setTimeout(() => {
          setSelectedEvents([]);
        }, 100);
      };
    
      return(
        <div
          className="month-view-container"
        >
          <div className= {`mb-4 border border-gray-300 rounded p-1 ${anyDayisDraggingOver ? 'bg-gray-200' : ''}`}>
            <h3 className="font-bold mb-2">Any Day</h3>
            <Droppable droppableId="any-day" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`any-day-section`} 
                  style={{
                    minHeight: '60px',
                  }}
                  onClick={handleMonthViewClick}
                >
                  {snapshot.isDraggingOver && setAnyDayIsDraggingOver(true)}
                  {!snapshot.isDraggingOver && setAnyDayIsDraggingOver(false)}
                  <div className={`overflow-x-auto whitespace-nowrap`}>
                    <div className="flex space-x-2">
                      {getAnyDayEvents().map((event, index) => renderEvent(event, index, true))}
                      {provided.placeholder}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold">{day}</div>
            ))}
            {calendarDays.map(day => renderDay(day))}
          </div>
        </div>
      );
    }
  
    return (
      <DragDropContext onDragEnd={onEventMove}>
        <div className="month-view">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={handlePreviousMonth}
              className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}
            >
              &lt; Previous Month
            </button>
            <h2 className="text-xl font-bold text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button 
              onClick={handleNextMonth}
              className={`dimension-theme-colored rounded ${!isMobile ? 'p-2' : ''} text-sm`}
            >
              Next Month &gt;
            </button>
          </div>
          {isMinimized ? renderMinimizedView() : renderMaximizedView()}
        </div>
      </DragDropContext>
    );
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = ''; // Reset cursor style
        setDraggedEvents(null);
        setDragIndicator(null);
      }
      stopScrolling(); // Ensure scrolling stops when mouse is released anywhere
    };

    const handleGlobalTouchEnd = () => {
      handleGlobalMouseUp();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      if (dayViewSchedulerRef.current) {
        dayViewSchedulerRef.current.removeEventListener('touchmove', preventDefaultForTouch);
      }
      stopScrolling(); // Clean up any ongoing scrolling
    };
  }, [isDragging]);

  useEffect(() => {
    if (actionSchedulerContentRef.current) {
      if (isActionSchedulerMinimized) {
        actionSchedulerContentRef.current.style.maxHeight = 'none';
      } else {
        actionSchedulerContentRef.current.style.maxHeight = `${actionSchedulerContentRef.current.scrollHeight}px`;
      }
    }
  }, [isActionSchedulerMinimized, scheduleActions, use24HourFormat]);
  
  const handleMouseMove = (event) => {
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    lastMousePositionRef.current = { clientX, clientY };
  
    if (draggedEvents && draggedEvents.length > 0 && dayViewRegularScheduleRef.current && !isDailySchedulerMinimized) {
      // Find top-most and bottom-most dragged events
      const topEvent = draggedEvents.reduce((top, event) => {
        const eventEl = document.getElementById(`event-${event.id}`);
        return eventEl && eventEl.getBoundingClientRect().top < top.getBoundingClientRect().top ? eventEl : top;
      }, document.getElementById(`event-${draggedEvents[0].id}`));
  
      const topEventInAnyTime = anyTimeEvents.some(event => topEvent.id.includes(event.id));
      
      const bottomEvent = draggedEvents.reduce((bottom, event) => {
        const eventEl = document.getElementById(`event-${event.id}`);
        return eventEl && eventEl.getBoundingClientRect().bottom > bottom.getBoundingClientRect().bottom ? eventEl : bottom;
      }, document.getElementById(`event-${draggedEvents[0].id}`));
  
      const topEventRect = topEvent.getBoundingClientRect();
      const bottomEventRect = bottomEvent.getBoundingClientRect();
  
      // Auto-scrolling logic

      // Get the dashboard header element
      const dashboardHeader = document.getElementById('dashboard-header');
      const headerHeight = dashboardHeader ? dashboardHeader.offsetHeight : 0;
      if (topEventRect.top - headerHeight < SCROLL_THRESHOLD) {
        if(!topEventInAnyTime){
          startScrolling(-1); // Scroll up
        }
      } else if (window.innerHeight - bottomEventRect.bottom < SCROLL_THRESHOLD) {
        startScrolling(1); // Scroll down
      } else {
        stopScrolling();
      }
  
      updateDraggedEventsPosition();
    }
    
    if (selectionBox && dayViewRegularScheduleRef.current) {
      const schedulerRect = dayViewRegularScheduleRef.current.getBoundingClientRect();
      const relativeX = clientX - schedulerRect.left;
      const relativeY = clientY - schedulerRect.top;
  
      setSelectionBox(prev => ({
        ...prev,
        endX: relativeX,
        endY: relativeY
      }));
    }
  };
  
  const handleMouseUp = (event) => {
    if (event && event.touches) {
      dayViewSchedulerRef.current.removeEventListener('touchmove', preventDefaultForTouch);
    }
    if (draggedEvents) {
      setDraggedEvents(null);
      setDragIndicator(null);
      setIsDragging(false);
      setIsDraggingTouchWithLog(false);
      document.body.style.cursor = '';
      const updatedActions = scheduleActions.map((action) => {
        const event = [...dynamicEvents, ...anyTimeEvents].find(e => e.id === action.id);
        if (event) {
          if(event.type === "unspecified"){
            return{
              ...action,
              type: event.type,
              startTime: '',
              endTime: '' 
            }
          }
          else{
            if(!event.lastDragged){
              event.lastDragged = 0;
            }
            return {
              ...action,
              type: event.type,
              startTime: event.startTime,
              endTime: event.endTime,
              lastDragged: event.lastDragged
            };
          }
        }
        return action;
      });
      setScheduleActions(updatedActions);
      updateLocalHabitData({ scheduleActions: updatedActions });
    } else if (selectionBox) {
      // Select events that intersect with the selection box
      const selectedIds = [...dynamicEvents, ...anyTimeEvents].filter(event => {
        const eventElement = document.getElementById(`event-${event.id}`);
        if (eventElement) {
          const eventRect = eventElement.getBoundingClientRect();
          const schedulerRect = dayViewRegularScheduleRef.current.getBoundingClientRect();
          
          const eventLeft = eventRect.left - schedulerRect.left;
          const eventRight = eventRect.right - schedulerRect.left;
          const eventTop = eventRect.top - schedulerRect.top;
          const eventBottom = eventRect.bottom - schedulerRect.top;
  
          const boxLeft = Math.min(selectionBox.startX, selectionBox.endX);
          const boxRight = Math.max(selectionBox.startX, selectionBox.endX);
          const boxTop = Math.min(selectionBox.startY, selectionBox.endY);
          const boxBottom = Math.max(selectionBox.startY, selectionBox.endY);
  
          return (
            eventLeft < boxRight &&
            eventRight > boxLeft &&
            eventTop < boxBottom &&
            eventBottom > boxTop
          );
        }
        return false;
      }).map(event => event.id);
      
      setSelectedEvents(selectedIds);
      setSelectionBox(null);
    }
    stopScrolling();
  };

    const handleMouseDown = (event) => {
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    if (dayViewRegularScheduleRef.current) {
      const clickedEvent = getEventFromPoint(clientX, clientY);
      
      if (clickedEvent) {
        setIsDragging(true);
        document.body.style.cursor = 'move';
        const eventsToSelect = selectedEvents.includes(clickedEvent.id) ? selectedEvents : [clickedEvent.id];
        setSelectedEvents(eventsToSelect);
  
        const draggedEventInfo = eventsToSelect.map(id => {
          const eventData = [...dynamicEvents, ...anyTimeEvents].find(e => e.id === id);
          return {
            id,
            initialY: clientY,
            initialStartTime: eventData.startTime,
            initialEndTime: eventData.endTime,
            isAnyTime: eventData.type === 'unspecified',
            isClicked: id === clickedEvent.id  // Mark the clicked event
          };
        });
  
        setDraggedEvents(draggedEventInfo);
        lastMousePositionRef.current = { clientX, clientY };
        setDragIndicator({
          startTime: clickedEvent.startTime,
          endTime: clickedEvent.endTime,
          isAnyTime: clickedEvent.type === 'unspecified'
        });
      } else if (!event.touches) {
        // Start selection box only for mouse events, not touch
        const schedulerRect = dayViewRegularScheduleRef.current.getBoundingClientRect();
        const relativeX = clientX - schedulerRect.left;
        const relativeY = clientY - schedulerRect.top;
        setSelectionBox({
          startX: relativeX,
          startY: relativeY,
          endX: relativeX,
          endY: relativeY
        });
        setSelectedEvents([]);
      }
    }
  };

  const calculateScrollSpeed = (distance) => {
    const maxSpeed = 15; // Maximum scroll speed in pixels per frame
    const minSpeed = 1; // Minimum scroll speed in pixels per frame
    const speedFactor = 0.3; // Adjust this to change how quickly the speed increases

    return Math.min(maxSpeed, Math.max(minSpeed, distance * speedFactor));
  };

  const startScrolling = (direction) => {
    if (scrollIntervalRef.current) return;
    setIsScrolling(true);
    scrollIntervalRef.current = setInterval(() => {
      const dayViewElement = document.querySelector('.day-view');
      const dashboardContent = document.getElementById('dashboard-content');
      
      if (!dayViewElement || !dashboardContent) {
        stopScrolling();
        return;
      }
  
      const dayViewRect = dayViewElement.getBoundingClientRect();
      const mouseY = lastMousePositionRef.current.clientY;
  
      // Check if mouse is outside the day-view element
      if (mouseY <= dayViewRect.top || mouseY >= dayViewRect.bottom) {
        stopScrolling();
        return;
      }
  
      const scrollSpeed = calculateScrollSpeed(Math.abs(mouseY - (direction < 0 ? dayViewRect.top : dayViewRect.bottom)));
  
      const currentScrollTop = dashboardContent.scrollTop;
      dashboardContent.scrollBy(0, direction * scrollSpeed);
  
      // If there was no change in scroll position, stop scrolling
      if (dashboardContent.scrollTop === currentScrollTop) {
        stopScrolling();
        return;
      }
  
      updateDraggedEventsPosition();
    }, 16); // ~60fps
  };


  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrolling(false);
  };
  
  // Helper function to safely format minutes to time
  const formatMinutesToTime = (minutes) => {
    minutes = Math.round(minutes);
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Helper function to safely get minutes from midnight
  const getMinutesFromMidnight = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60 + minutes) % MINUTES_IN_DAY;
  };

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    const clickedEvent = getEventFromPoint(touch.clientX, touch.clientY);
    if (clickedEvent) {
      setIsDraggingTouchWithLog(true);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, isTouch: true });
    }
  }, [getEventFromPoint, handleMouseDown]);
  
  const handleTouchMove = useCallback((event) => {
    if (isDraggingTouch) {
      event.preventDefault();
      const touch = event.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, isTouch: true });
    }
  }, [isDraggingTouch, handleMouseMove]);
  
  const handleTouchEnd = useCallback((event) => {
    if (isDraggingTouch) {
      setIsDraggingTouchWithLog(false);
      handleMouseUp({ isTouch: true });
    }
  }, [isDraggingTouch, handleMouseUp]);


  useEffect(() => {
    const scheduler = dayViewSchedulerRef.current;
    if (scheduler) {
      scheduler.addEventListener('touchstart', handleTouchStart, { passive: false });
      scheduler.addEventListener('touchmove', handleTouchMove, { passive: false });
      scheduler.addEventListener('touchend', handleTouchEnd);
    }
  
    return () => {
      if (scheduler) {
        scheduler.removeEventListener('touchstart', handleTouchStart);
        scheduler.removeEventListener('touchmove', handleTouchMove);
        scheduler.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const handleAddMonthlyRuleDropdown = (actionId) => {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          monthlyRules: [...action.monthlyRules, { id: uuidv4(), value: 'fixed', ruleValue: 1 }]
        };
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  };
  
  const handleDeleteMonthlyRuleDropdown = (actionId, dropdownId) => {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {

        const ruleToDelete = action.monthlyRules.find(rule => rule.id === dropdownId);
        // Check if the rule to be deleted has 'specific' value
        if (ruleToDelete && ruleToDelete.value === 'specific') {{
            // Only call handleActionWeekDaySpecificityChange if this was the last 'specific' rule
            handleActionWeekDaySpecificityChange(actionId, 'any');
          }
        }
        return {
          ...action,
          monthlyRules: action.monthlyRules.filter(rule => rule.id !== dropdownId)
        };
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  };
  
  const handleMonthlyRuleDropdownChange = (actionId, dropdownId, value) => {
    let changedFromSpecificWeekDays = false;
    let changedToSpecificWeekDays = false;
    if(value == 'specific'){
      changedToSpecificWeekDays = true;
    }
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          monthlyRules: action.monthlyRules.map(rule => {
            if (rule.id === dropdownId) {
              if (value === 'fixed') {
                if(rule.value == 'specific'){
                  changedFromSpecificWeekDays = true;
                }
                return { ...rule, value, ruleValue: 1 };
              }
              if (value === 'ordinal') {
                if(rule.value == 'specific'){
                  changedFromSpecificWeekDays = true;
                }
                return { ...rule, value, ruleValue: ["1", "Mon"] };
              }
              if (value === 'specific') {
                return { ...rule, value, ruleValue: null };
              }
            }
            return rule;
          })
        };
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });

    // //Need to call this here to accurately update our selected days and weekDaySpecificty after changing the dropdown
    // if(changedToSpecificWeekDays){
    //   handleActionWeekDaySpecificityChange(actionId, 'specific')
    // } 
    // else if(changedFromSpecificWeekDays){
    //   handleActionWeekDaySpecificityChange(actionId, 'any')
    // }
  };

  useEffect(() => {
    scheduleActions.forEach(action => {
      if(action.monthlyDaySpecificity == 'any' && action.weekDaySpecificity != 'any'){        
        handleActionWeekDaySpecificityChange(action.id, 'any');
      } else {
      // Check if any monthly rule has 'specific' value but weekdaySpecificity is 'any' or selectedDays is empty
      const hasSpecificRuleWithAnyWeekday = action.monthlyRules.some(rule => rule.value === 'specific' && (action.weekDaySpecificity === 'any' || !action.selectedDays || action.selectedDays.length === 0));
      // Check if there are no monthly rules with 'specific' value but weekdaySpecificity is 'specific' or selectedDays is not empty
      const hasNoSpecificRuleWithSpecificWeekday = !action.monthlyRules.some(rule => rule.value === 'specific') && (action.weekDaySpecificity === 'specific' || action.selectedDays && action.selectedDays.length > 0);

        if (hasSpecificRuleWithAnyWeekday) {
          handleActionWeekDaySpecificityChange(action.id, 'specific');
        } else if (hasNoSpecificRuleWithSpecificWeekday) {
          handleActionWeekDaySpecificityChange(action.id, 'any');
        }
      }
    });
  }, [scheduleActions]);
  
  function handleMonthlyRuleChange(actionId, dropDownValue, value, index) {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        const updatedRules = [...action.monthlyRules];
        updatedRules[index] = { ...updatedRules[index], value: dropDownValue, ruleValue: value };
        return { ...action, monthlyRules: updatedRules };
      }
      return action;
    });
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  }

  const renderMinimizedActionScheduler = () => {
    if (scheduleActions.length === 0) return null;
  
    const selectedActions = selectedEvents.length > 0
      ? selectedEvents
          .map(id => scheduleActions.find(action => action.id === id))
          .filter(action => action !== undefined)
          .sort((a, b) => scheduleActions.indexOf(a) - scheduleActions.indexOf(b))
      : [scheduleActions[currentMinimizedAction]].filter(action => action !== undefined);
  
    if (selectedActions.length === 0) return null;
  
    const topActionIndex = scheduleActions.indexOf(selectedActions[0]);
    const isFirstActionSelected = topActionIndex === 0;
    const isLastActionSelected = topActionIndex === scheduleActions.length - 1;
  
    const handlePrevAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prevIndex = Math.max(0, topActionIndex - 1);
      setCurrentMinimizedAction(prevIndex);
      setSelectedEvents([]);
    };
  
    const handleNextAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nextIndex = Math.min(scheduleActions.length - 1, topActionIndex + 1);
      setCurrentMinimizedAction(nextIndex);
      setSelectedEvents([]);
    };

    const getMonthlyRuleValue = (action, index) => {
      if (action.monthlyRules && action.monthlyRules[index] && action.monthlyRules[index].value && action.monthlyRules[index].value === 'fixed' && action.monthlyRules[index].ruleValue) {
          return action.monthlyRules[index].ruleValue;
      } else {
          return 1;
      }
  }
  
    return (
      <div>
        {selectedActions.map((action, index) => (
          <div 
            key={action.id} 
            className={`bg-gray-100 p-4 mb-4 rounded ${index > 0 ? 'mt-8' : ''} ${
              selectedEvents.includes(action.id) 
                ? 'border-4' 
                : 'border'
            }`}
            style={{ 
              borderColor: selectedEvents.includes(action.id) ? globalActionColor : '#d1d5db' // gray-300
            }}
          >
            <div className="block items-center justify-center mb-2">
             <div className='flex justify-center'>
                {index === 0 && scheduleActions.length > 1 && (
                  <button
                    onClick={handlePrevAction}
                    disabled={isFirstActionSelected}
                    className={`px-2 py-1 rounded ${isFirstActionSelected ? 'bg-gray-300 cursor-not-allowed' : 'dimension-theme-colored'}`}
                  >
                    &lt;
                  </button>
                )}
                <h4 className="text-md font-medium mx-4 flex items-center justify-center">
                  <span className="inline-block align-middle font-bold">
                    {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                      ? `${truncateText(localHabitData.habit_action)} `
                      : ''
                    }Action #{scheduleActions.indexOf(action) + 1}
                  </span>
                </h4>
                {index === 0 && scheduleActions.length > 1 && (
                  <button
                    onClick={handleNextAction}
                    disabled={isLastActionSelected}
                    className={`px-2 py-1 rounded ${isLastActionSelected ? 'bg-gray-300 cursor-not-allowed' : 'dimension-theme-colored'}`}
                  >
                    &gt;
                  </button>
                )}
              </div>
              {localHabitData.habit_frequencyPeriod === 'monthly' && (
                <div className="mt-2">
                  <label>Day of the Month:</label>
                  <select
                    value={action.monthlyDaySpecificity || 'any'}
                    onChange={(e) => handleActionMonthlyDaySpecificityChange(action.id, e.target.value)}
                    className="mt-1 mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                  >
                    <option value="any">Any day</option>
                    <option value="specific">Custom Scheduling</option>
                  </select>
                  {(action.monthlyDaySpecificity && action.monthlyDaySpecificity == 'specific' ) && 
                    <div className='flex flex-col'>
                      {action.monthlyRules.map((rule, index) => (
                        <div key={index} className='flex flex-col p-2 mb-4 rounded border-gray-300 border'>
                          <div className="flex flex-col items-center bg-gray-100 rounded">
                            <h4 className='font-semibold'>Rule #{index + 1}</h4>
                            <select
                              value={rule.value || 'fixed'}
                              onChange={(e) => { e.preventDefault(); e.stopPropagation(); handleMonthlyRuleDropdownChange(action.id, rule.id, e.target.value);}}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                            >
                              <option value="fixed">Fixed Day</option>
                              <option value="ordinal">Ordinal Week Day</option>
                              {!action.monthlyRules.some(r => r.value === 'specific' && r.id !== rule.id) && (
                                <option value="specific">Specific Week Day(s)</option>
                              )}
                            </select>
                          </div>
                          <div className='flex justify-center'>
                          {rule.value == 'fixed' && (
                            <div className='flex flex-col'>
                              <div className='flex flex-row'>
                                <label>1st</label>
                                <input
                                  type="range"
                                  value={getMonthlyRuleValue(action, index)}
                                  onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, parseInt(e.target.value), index)}
                                  min={1}
                                  max={31}
                                  className="w-full mx-2 border-none rounded-md"
                                  style={{ padding: 0, accentColor: 'gray' }}
                                />
                                <label>31st</label>
                              </div>
                              <div className="flex items-center justify-center">
                                <span className='text-center'>Repeats every <b>{getMonthlyRuleValue(action, index) + getOrdinalSuffix(getMonthlyRuleValue(action, index))}</b> Day of the Month</span>
                              </div>
                            </div>
                          )}
                          {rule.value == 'ordinal' && (
                            <div className='flex flex-col items-center'>
                              <div className="flex flex-col items-center justify-center">
                                <span>Repeats every</span>
                                <div className='flex flex-row'>
                                  <select
                                    value={rule.ruleValue[0]}
                                    onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, [e.target.value, rule.ruleValue[1]], index)}
                                    className="mx-2 rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                                  >
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                    <option value="5">Last</option>
                                  </select>
                                  <select
                                    value={rule.ruleValue[1]}
                                    onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, [rule.ruleValue[0], e.target.value], index)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                                  >
                                    <option value="Sun">Sunday</option>
                                    <option value="Mon">Monday</option>
                                    <option value="Tue">Tuesday</option>
                                    <option value="Wed">Wednesday</option>
                                    <option value="Thu">Thursday</option>
                                    <option value="Fri">Friday</option>
                                    <option value="Sat">Saturday</option>
                                  </select>
                                </div>
                                <span className="ml-2">of the Month</span>
                              </div>
                            </div>
                          )}
                          {rule.value == 'specific' && (
                            <div className='flex flex-col'>
                              <span className='text-center'>This action will be scheduled weekly on the following days: </span>
                              <div className="mt-2 flex justify-between">
                                {['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'].map((shortDay) => {
                                  const fullDay = getFullDayName(shortDay);
                                  return (
                                    <label key={shortDay} className="flex flex-col items-center">
                                      <div className="flex flex-col items-center">
                                        <input
                                          type="checkbox"
                                          checked={action.selectedDays?.includes(fullDay) || false}
                                          onChange={(e) => handleActionDaySelection(action.id, fullDay, e.target.checked)}
                                          className="mb-1"
                                        />
                                        <span className="text-lg">{shortDay}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                          )}
                          </div>
                          {rule.value == 'fixed' && rule.ruleValue >= 29 && (
                                <span className='text-sm text-gray-500 italic text-center'>Days 29-31 represent last day if Month too short</span>
                              )}
                          {action.monthlyRules.length > 1 && (
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMonthlyRuleDropdown(action.id, rule.id)}}
                              className="px-2 py-1 rounded dimension-theme-colored"
                            >
                              Delete Rule
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddMonthlyRuleDropdown(action.id); }} 
                        className="px-2 py-1 rounded dimension-theme-colored"
                      >
                        Add New Rule
                      </button>
                    </div>
                  }
                  </div>
              )}
              {localHabitData.habit_frequencyPeriod === 'weekly' && (
                <div className="mt-2">
                  <label>Day(s) of the week:</label>
                  <select
                    value={action.weekDaySpecificity || 'any'}
                    onChange={(e) => handleActionWeekDaySpecificityChange(action.id, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                  >
                    <option value="any">Any day</option>
                    <option value="specific">Specific day(s)</option>
                  </select>
                  {action.weekDaySpecificity === 'specific' && (
                    <div className="mt-2 flex justify-between">
                      {['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'].map((shortDay) => {
                        const fullDay = getFullDayName(shortDay);
                        return (
                          <label key={shortDay} className="flex flex-col items-center">
                            <div className="flex flex-col items-center">
                              <input
                                type="checkbox"
                                checked={action.selectedDays?.includes(fullDay) || false}
                                onChange={(e) => handleActionDaySelection(action.id, fullDay, e.target.checked)}
                                className="mb-1"
                              />
                              <span className="text-lg">{shortDay}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label>Time of Day:</label>
                <select
                  value={action.type}
                  onChange={(e) => handleActionTypeChange(action.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                >
                  <option value="unspecified">Any Time</option>
                  <option value="scheduled">Specific Time</option>
                </select>
                {action.type === 'scheduled' && (
                  <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center justify-center mb-2 sm:mb-0 sm:flex-1">
                      <span className="mr-2">From:</span>
                      {renderTimeInput(action.id, 'startTime')}
                    </div>
                    <div className="flex items-center justify-center sm:flex-1 sm:ml-4">
                      <span className="mr-2">To:</span>
                      {renderTimeInput(action.id, 'endTime')}
                    </div>
                  </div>
                )}
              </div>
              </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMaximizedActionScheduler = () => {
    return (
      <>
        {scheduleActions.map((action, index) => (
          <div 
            key={action.id} 
            className={`bg-gray-100 p-4 mb-4 rounded ${
              selectedEvents.includes(action.id) 
                ? 'border-4' 
                : 'border'
            }`}
            style={{ 
              borderColor: selectedEvents.includes(action.id) ? globalActionColor : '#d1d5db' // gray-300
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <h4 className="text-md font-medium mx-4 flex items-center">
                <span className="inline-block align-middle font-bold">
                  {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                    ? `${truncateText(localHabitData.habit_action)} `
                    : ''
                  }Action #{index + 1}
                </span>
              </h4>
            </div>
            {localHabitData.habit_frequencyPeriod === 'monthly' && (
              <div className="mt-2">
                <label>Day of the Month:</label>
                <select
                  value={action.monthlyDaySpecificity || 'any'}
                  onChange={(e) => handleActionMonthlyDaySpecificityChange(action.id, e.target.value)}
                  className="mt-1 mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                >
                  <option value="any">Any day</option>
                  <option value="specific">Custom Scheduling</option>
                </select>
                {(action.monthlyDaySpecificity && action.monthlyDaySpecificity === 'specific') && 
                  <div className='flex flex-col'>
                    {action.monthlyRules.map((rule, index) => (
                      <div key={index} className='flex flex-col p-2 mb-4 rounded border-gray-300 border'>
                        <div className="flex flex-col items-center bg-gray-100 rounded">
                          <h4 className='font-semibold'>Rule #{index + 1}</h4>
                          <select
                            value={rule.value || 'fixed'}
                            onChange={(e) => { e.preventDefault(); e.stopPropagation(); handleMonthlyRuleDropdownChange(action.id, rule.id, e.target.value);}}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                          >
                            <option value="fixed">Fixed Day</option>
                            <option value="ordinal">Ordinal Week Day</option>
                            {!action.monthlyRules.some(r => r.value === 'specific' && r.id !== rule.id) && (
                              <option value="specific">Specific Week Day(s)</option>
                            )}
                          </select>
                        </div>
                        <div className='flex justify-center'>
                          {rule.value === 'fixed' && (
                            <div className='flex flex-col'>
                              <div className='flex flex-row'>
                                <label>1st</label>
                                <input
                                  type="range"
                                  value={getMonthlyRuleValue(action, index)}
                                  onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, parseInt(e.target.value), index)}
                                  min={1}
                                  max={31}
                                  className="w-full mx-2 border-none rounded-md"
                                  style={{ padding: 0, accentColor: 'gray' }}
                                />
                                <label>31st</label>
                              </div>
                              <div className="flex items-center justify-center">
                                <span className='text-center'>Repeats every <b>{getMonthlyRuleValue(action, index) + getOrdinalSuffix(getMonthlyRuleValue(action, index))}</b> Day of the Month</span>
                              </div>
                            </div>
                          )}
                          {rule.value === 'ordinal' && (
                            <div className='flex flex-col items-center'>
                              <div className="flex flex-col items-center justify-center">
                                <span>Repeats every</span>
                                <div className='flex flex-row'>
                                  <select
                                    value={rule.ruleValue[0]}
                                    onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, [e.target.value, rule.ruleValue[1]], index)}
                                    className="mx-2 rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                                  >
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                    <option value="5">Last</option>
                                  </select>
                                  <select
                                    value={rule.ruleValue[1]}
                                    onChange={(e) => handleMonthlyRuleChange(action.id, rule.value, [rule.ruleValue[0], e.target.value], index)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                                  >
                                    <option value="Sun">Sunday</option>
                                    <option value="Mon">Monday</option>
                                    <option value="Tue">Tuesday</option>
                                    <option value="Wed">Wednesday</option>
                                    <option value="Thu">Thursday</option>
                                    <option value="Fri">Friday</option>
                                    <option value="Sat">Saturday</option>
                                  </select>
                                </div>
                                <span className="ml-2">of the Month</span>
                              </div>
                            </div>
                          )}
                          {rule.value === 'specific' && (
                            <div className='flex flex-col'>
                              <span className='text-center'>This action will be scheduled weekly on the following days: </span>
                              <div className="mt-2 flex justify-between">
                                {['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'].map((shortDay) => {
                                  const fullDay = getFullDayName(shortDay);
                                  return (
                                    <label key={shortDay} className="flex flex-col items-center">
                                      <div className="flex flex-col items-center">
                                        <input
                                          type="checkbox"
                                          checked={action.selectedDays?.includes(fullDay) || false}
                                          onChange={(e) => handleActionDaySelection(action.id, fullDay, e.target.checked)}
                                          className="mb-1"
                                        />
                                        <span className="text-lg">{shortDay}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        {rule.value === 'fixed' && rule.ruleValue >= 29 && (
                          <span className='text-sm text-gray-500 italic text-center'>Days 29-31 represent last day if Month too short</span>
                        )}
                        {action.monthlyRules.length > 1 && (
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMonthlyRuleDropdown(action.id, rule.id)}}
                            className="px-2 py-1 rounded dimension-theme-colored"
                          >
                            Delete Rule
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddMonthlyRuleDropdown(action.id); }} 
                      className="px-2 py-1 rounded dimension-theme-colored"
                    >
                      Add New Rule
                    </button>
                  </div>
                }
              </div>
            )}
            {localHabitData.habit_frequencyPeriod === 'weekly' && (
              <div className="mt-2">
                <label>Day(s) of the week:</label>
                <select
                  value={action.weekDaySpecificity || 'any'}
                  onChange={(e) => handleActionWeekDaySpecificityChange(action.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
                >
                  <option value="any">Any day</option>
                  <option value="specific">Specific day(s)</option>
                </select>
                {action.weekDaySpecificity === 'specific' && (
                  <div className="mt-2 flex justify-between">
                    {['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'].map((shortDay) => {
                      const fullDay = getFullDayName(shortDay);
                      return (
                        <label key={shortDay} className="flex flex-col items-center">
                          <div className="flex flex-col items-center">
                            <input
                              type="checkbox"
                              checked={action.selectedDays?.includes(fullDay) || false}
                              onChange={(e) => handleActionDaySelection(action.id, fullDay, e.target.checked)}
                              className="mb-1"
                            />
                            <span className="text-lg">{shortDay}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div>
              <label>Time of Day:</label>
              <select
                value={action.type}
                onChange={(e) => handleActionTypeChange(action.id, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-700 focus:ring-opacity-50"
              >
                <option value="unspecified">Any Time</option>
                <option value="scheduled">Specific Time</option>
              </select>
              {action.type === 'scheduled' && (
                <div className="mt-2 flex items-center space-x-2">
                  <span>From:</span>
                  {renderTimeInput(action.id, 'startTime')}
                  <span>To:</span>
                  {renderTimeInput(action.id, 'endTime')}
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  };
  const handleActionWeekDaySpecificityChange = (actionId, value) => {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        if (value === 'specific' && action.weekDaySpecificity === 'any') {
          const today = format(new Date(), 'EEEE');
          const newSelectedDays = [today];
          return { 
            ...action, 
            weekDaySpecificity: value, 
            selectedDays: newSelectedDays
          };
        } else if (value === 'any') {
          // Move the event back to the "Any Day" section
          onEventMoveWeekView (actionId, action.selectedDays[0] || 'Monday', 'any-day');
  
          return { 
            ...action, 
            weekDaySpecificity: value, 
            selectedDays: []
          };
        }
        // If it's already 'specific', just keep the current selectedDays
        return { ...action, weekDaySpecificity: value };
      }
      return action;
    });
  
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  
    // Force a re-render of the weekly view
    setWeeklySchedulerCurrentView(prev => prev === 'week' ? 'day' : 'week');
    setTimeout(() => setWeeklySchedulerCurrentView('week'), 0);
  };

  const handleActionDaySelection = (actionId, day, isChecked) => {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        const selectedDays = action.selectedDays || [];
        let updatedDays;
        
        // Convert the short day name to full day name
        const fullDayName = getFullDayName(day);
        
        if (isChecked) {
          updatedDays = [...new Set([...selectedDays, fullDayName])];
          onEventMoveWeekView (actionId, 'any-day', fullDayName);
        } else {
          updatedDays = selectedDays.filter(d => d !== fullDayName);
          if (updatedDays.length === 0) {
            onEventMoveWeekView (actionId, fullDayName, 'any-day');
          } else {
            onEventMoveWeekView (actionId, fullDayName, updatedDays[0]);
          }
        }
  
        return { 
          ...action, 
          selectedDays: updatedDays, 
          weekDaySpecificity: updatedDays.length > 0 ? 'specific' : 'any'
        };
      }
      return action;
    });
  
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  
    setWeeklySchedulerCurrentView(prev => prev === 'week' ? 'day' : 'week');
    setTimeout(() => setWeeklySchedulerCurrentView('week'), 0);
  };
  
  // Helper function to convert short day names to full day names
  const getFullDayName = (shortDay) => {
    const dayMap = {
      'Sun.': 'Sunday',
      'Mon.': 'Monday',
      'Tue.': 'Tuesday',
      'Wed.': 'Wednesday',
      'Thu.': 'Thursday',
      'Fri.': 'Friday',
      'Sat.': 'Saturday'
    };
    return dayMap[shortDay] || shortDay;
  };

  const handleActionMonthlyDaySpecificityChange = (actionId, value) => {
    const updatedActions = scheduleActions.map(action => {
      if (action.id === actionId) {
        if (action.monthlyDaySpecificity === 'specific' && value === 'any') {
          // Clear all monthly rules when changing from 'specific' to 'any'
          return {
            ...action,
            monthlyDaySpecificity: value,
            monthlyRules: [],
            weekDaySpecificity: 'any',
            selectedDays: []
          };
        } else {
          return { 
            ...action, 
            monthlyDaySpecificity: value
          };
        }
      }
      return action;
    });
  
    setScheduleActions(updatedActions);
    updateLocalHabitData({ scheduleActions: updatedActions });
  
    // Force a re-render of the monthly view
    setMonthlySchedulerCurrentView(prev => prev === 'month' ? 'week' : 'month');
    setTimeout(() => setMonthlySchedulerCurrentView('month'), 0);
  };
  
  return (
    <div className="habitScheduler max-w-2xl mx-auto">
        <>
          <div className="mb-4 flex justify-center items-center flex-wrap">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHabitSchedulerToggle(); }}
              className="px-4 py-2 dimension-theme-colored rounded"
            >
              {showHabitScheduler ? 'Hide Habit Scheduler 🗓️' : 'Show Habit Scheduler 🗓️'}
            </button>
          </div>
          {showHabitScheduler && (
            <div className="habitSchedulerContents border border-gray-300 p-4 mt-4 rounded" ref={habitSchedulerRef}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex-grow">
                <h3 className="text-lg font-bold text-center">
                  Schedule your {localHabitData.habit_frequencyNum} Daily 
                  {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                    ? ` "${truncateText(localHabitData.habit_action)}"` 
                    : ''
                  } {localHabitData.habit_frequencyNum > 1 ? 'Actions' : 'Action'}
                </h3>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleActionSchedulerMinimize(); }}
                  className="w-6 h-6 flex items-center justify-center dimension-theme-colored ml-4"
                >
                  {isActionSchedulerMinimized ? '+' : '-'}
                </button>
              </div>
              <div 
                ref={actionSchedulerContentRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isActionSchedulerMinimized ? 'auto' : '500px' }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-md font-semibold mr-2 flex items-center">
                    <span className="inline-block align-middle">
                      Set {localHabitData.habit_action ? `${truncateText(localHabitData.habit_action)} ` : ""}Action Color:
                    </span>
                  </span>
                  <ColorPicker
                    initialColor={globalActionColor}
                    onChange={handleGlobalColorChange}
                    key={currentDimension}
                  />
                </div>
                {isActionSchedulerMinimized 
                  ? renderMinimizedActionScheduler()
                  : renderMaximizedActionScheduler()
                }
              </div>
              {localHabitData.habit_frequencyPeriod === 'daily' && (
                renderDailyScheduler()
              )}
              {localHabitData.habit_frequencyPeriod === 'weekly' && (
                renderWeeklyScheduler()
              )}
              {localHabitData.habit_frequencyPeriod === 'monthly' && (
                renderMonthlyScheduler()
              )}
            </div>
          )}
        </>
    </div>
  );
};

export default HabitScheduler;