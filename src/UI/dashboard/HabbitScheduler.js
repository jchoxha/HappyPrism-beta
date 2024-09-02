import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parse, differenceInMinutes, addMinutes, setMinutes, getMinutes, setHours, getHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from '@mui/material';

//TODO: 
//      ADD A + AND - BUTTON NEXT TO FREQUENCY NUM INPUT FOR EASY INCREMENTAL ADJUSTMENT
//      FIX THE SELECTED EVENT BLOCK COLORATION
//      CREATE COLOR PICKER COMPONENT AND ADD IT TO ACTION SCHEDULER
//      MAKE SELECTED ACTION(S) APPEAR IN MINIMIZED ACTION SCHEDULER
//      HIGHLIGHT SELECTED ACTION(S) IN MAXIMIZED ACTION SCHEDULER
//      CHANGE CURSOR TO POINTER OVER EVENT BLOCKS FOR MINIMIZED DAILY SCHEDULER
//      START WORKING ON THE WEEKLY/MONTHLY SCHEDULER

const MINUTES_IN_SCHEDULER = 25 * 60;
const MINUTES_IN_DAY = 24 * 60;
const HOUR_HEIGHT = 60; // pixels
const HOUR_LABEL_WIDTH = 60; // pixels

const DEFAULT_EVENT_DURATION = 30; // minutes
const DRAG_INTERVAL = 5; // minutes

const ANY_TIME_HEIGHT = 100; // pixels
const SECTION_GAP = 20; // pixels
const SCROLL_THRESHOLD = 50; // pixels from top/bottom to trigger scrolling

const HabitScheduler = ({ habitData, onHabitDataChange }) => {
  const [localHabitData, setLocalHabitData] = useState(habitData);
  const [showActionScheduler, setShowActionScheduler] = useState(false);
  const [isActionSchedulerMinimized, setIsActionSchedulerMinimized] = useState(true);
  const [scheduleActions, setScheduleActions] = useState([]);
  const [dynamicEvents, setDynamicEvents] = useState([]);
  const [draggedEvents, setDraggedEvents] = useState(null);
  const [dragIndicator, setDragIndicator] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  const [isDailySchedulerMinimized, setIsDailySchedulerMinimized] = useState(true);
  const [expandedSections, setExpandedSections] = useState([]);
  const actionSchedulerContentRef = useRef(null);
  const dailySchedulerRef = useRef(null);
  const [anyTimeEvents, setAnyTimeEvents] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIntervalRef = useRef(null);
  const lastMousePositionRef = useRef({ clientX: 0, clientY: 0 });
  const schedulerRef = useRef(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const setIsDraggingTouchWithLog = (value) => {
    setIsDraggingTouch(value);
  };
  const touchStartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentMinimizedAction, setCurrentMinimizedAction] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const preventScroll = useCallback((e) => {
    if (isDraggingTouch) {
      e.preventDefault();
    }
  }, [isDraggingTouch]);

  useEffect(() => {
    const scheduler = schedulerRef.current;
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
  }, [scheduleActions]);

  useEffect(() => {
    setLocalHabitData(habitData);
  }, [habitData]);

  useEffect(() => {
    if (localHabitData.habit_frequencyPeriod === 'daily' && localHabitData.habit_frequencyNum > 0) {
      const currentTime = new Date();
      const initialActions = Array(localHabitData.habit_frequencyNum).fill().map(() => ({
        id: uuidv4(),
        type: 'unspecified',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(addMinutes(currentTime, DEFAULT_EVENT_DURATION), 'HH:mm')
      }));
      setScheduleActions(initialActions);
    }
  }, [localHabitData.habit_frequencyPeriod, localHabitData.habit_frequencyNum]);

  const updateLocalHabitData = (updates) => {
    const updatedHabitData = { ...localHabitData, ...updates };
    setLocalHabitData(updatedHabitData);
    onHabitDataChange(updatedHabitData);
  };

  const handleActionSchedulerToggle = () => {
    setShowActionScheduler(!showActionScheduler);
    if (!showActionScheduler) {
      updateLocalHabitData({ scheduleActions });
    } else {
      updateLocalHabitData({ scheduleActions: [] });
    }
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
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
    console.log("assigning events to columns: ", events);
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
    if (draggedEvents && draggedEvents.length > 0 && dailySchedulerRef.current) {
      const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();
      const anyTimeRect = dailySchedulerRef.current.previousSibling.getBoundingClientRect();
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
    const anyTimeRect = dailySchedulerRef.current.previousSibling.getBoundingClientRect();
    const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();

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
    const scheduler = schedulerRef.current;
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

  const renderDailyScheduler = () => {
    let selBoxTopDiff = 0;
    
    if(dailySchedulerRef.current){
      selBoxTopDiff = dailySchedulerRef.current.parentNode.parentNode.getBoundingClientRect().top - dailySchedulerRef.current.getBoundingClientRect().top;
    }

    const renderMinimizedEvents = () => {
      // Sort events chronologically
      const sortedEvents = [...dynamicEvents].sort((a, b) => {
        const startA = getMinutesFromMidnight(a.startTime);
        const startB = getMinutesFromMidnight(b.startTime);
        return startA - startB;
      });
    
      return (
        <div className="relative" style={{ height: 'auto'}}>
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
            };
    
            return (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`bg-blue-500 text-white text-xs p-1 rounded ${
                  selectedEvents.includes(event.id) ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                }`}
                style={style}
              >
                <span className='truncate'>
                {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                  ? `${localHabitData.habit_action} #${actionIndex + 1}` 
                  : `Action #${actionIndex + 1}`
                } ({formatTime(event.startTime)} - {formatTime(event.endTime)})
                </span>
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
            {dynamicEvents.map((event) => {
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
  
              return (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={`bg-blue-500 text-white text-xs p-1 rounded cursor-move ${
                    selectedEvents.includes(event.id) ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                  } ${draggedEvents?.some(e => e.id === event.id) ? 'opacity-75' : ''}`}
                  style={style}
                >
                  <span className='truncate'>{localHabitData.habit_action && localHabitData.habit_action.length > 0 
                  ? `${localHabitData.habit_action} #${actionIndex + 1}` 
                  : `Action #${actionIndex + 1}`
                } ({formatTime(event.startTime)} - {formatTime(event.endTime)})</span>
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
            {anyTimeEvents.map((event) => {
              const actionIndex = getActionIndex(event.id);
              return (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={`bg-blue-500 text-white text-xs p-1 rounded mx-1 ${
                    selectedEvents.includes(event.id) ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                  } ${draggedEvents?.some(e => e.id === event.id) ? 'opacity-75' : ''} ${
                    isMobile ? 'cursor-pointer' : 'cursor-move'
                  }`}
                  style={{
                    width: '110px',
                    height: '60px',
                    flexShrink: 0
                  }}
                  onClick={() => isMobile && handleAnyTimeEventClick(event)}
                >
                  <span className='truncate'>{localHabitData.habit_action && localHabitData.habit_action.length > 0 
                    ? `${localHabitData.habit_action} #${actionIndex + 1}` 
                    : `Action #${actionIndex + 1}`
                  }</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  
    return (
      <div className="mt-6 relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Daily Scheduler</h3>
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
        <div 
          ref={schedulerRef}
          className="flex flex-col space-y-4 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging && !isDailySchedulerMinimized ? 'move' : 'default'}}
        >
          {/* Any Time section */}
          {(!isDailySchedulerMinimized || (isDailySchedulerMinimized && anyTimeEvents.length > 0)) && (
            <div className="border border-gray-300 rounded relative">
              {isDailySchedulerMinimized && (
                <h4 className="text-md font-medium p-2 bg-gray-100 border-b border-gray-300">
                  'Any Time' Actions
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
            ref={dailySchedulerRef}
            className="border border-gray-300 rounded relative" 
            style={{ height: isDailySchedulerMinimized ? 'auto' : `${HOUR_HEIGHT * 25}px` }}
          >
            {isDailySchedulerMinimized && dynamicEvents.length > 0 && (
              <h4 className="text-md font-medium p-2 bg-gray-100 border-b border-gray-300">
                Scheduled Actions
              </h4>
            )}
            {isDailySchedulerMinimized ? renderMinimizedEvents() : renderNormalEvents()}
          </div>
        </div>
        {/* Drag Indicator, currently disabled, rendering needs to be reworked */}
        {dragIndicator && !dragIndicator.isAnyTime && 0 && (
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
        )}
        
        {/* Selection Box */}
        {selectionBox && (
          <div 
            className="absolute bg-blue-200 opacity-50"
            style={{
              top: `${Math.min(selectionBox.startY - selBoxTopDiff, selectionBox.endY - selBoxTopDiff)}px`,
              left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
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
      if (schedulerRef.current) {
        schedulerRef.current.removeEventListener('touchmove', preventDefaultForTouch);
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

  const handleMouseDown = (event) => {
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    if (dailySchedulerRef.current) {
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
        const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();
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
  
  const handleMouseMove = (event) => {
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    lastMousePositionRef.current = { clientX, clientY };
  
    if (draggedEvents && draggedEvents.length > 0 && dailySchedulerRef.current && !isDailySchedulerMinimized) {
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
      if (topEventRect.top < SCROLL_THRESHOLD) {
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
    
    if (selectionBox && dailySchedulerRef.current) {
      const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();
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
      schedulerRef.current.removeEventListener('touchmove', preventDefaultForTouch);
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
          const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();
          
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
      const schedulerRect = dailySchedulerRef.current.getBoundingClientRect();
      const anyTimeRect = dailySchedulerRef.current.previousSibling.getBoundingClientRect();
      
      let eventToCheck;
      if (direction < 0) { // Scrolling up
        eventToCheck = draggedEvents.reduce((top, event) => {
          const eventEl = document.getElementById(`event-${event.id}`);
          return eventEl && eventEl.getBoundingClientRect().top < top.getBoundingClientRect().top ? eventEl : top;
        }, document.getElementById(`event-${draggedEvents[0].id}`));
      } else { // Scrolling down
        eventToCheck = draggedEvents.reduce((bottom, event) => {
          const eventEl = document.getElementById(`event-${event.id}`);
          return eventEl && eventEl.getBoundingClientRect().bottom > bottom.getBoundingClientRect().bottom ? eventEl : bottom;
        }, document.getElementById(`event-${draggedEvents[0].id}`));
      }

      const eventRect = eventToCheck.getBoundingClientRect();
      let distance;
      if (direction < 0) {
        distance = eventRect.top - ( SCROLL_THRESHOLD);
      } else {
        distance = (window.innerHeight - SCROLL_THRESHOLD) - eventRect.bottom;
      }

      if ((direction < 0 && distance < 0) || (direction > 0 && distance < 0)) {
        const scrollSpeed = calculateScrollSpeed(Math.abs(distance));
        window.scrollBy(0, direction * scrollSpeed);
        updateDraggedEventsPosition();
      } else {
        stopScrolling();
      }
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
    const scheduler = schedulerRef.current;
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

  const renderMinimizedActionScheduler = () => {
    if (scheduleActions.length === 0) return null;
  
    const action = scheduleActions[currentMinimizedAction];
    const isFirstAction = currentMinimizedAction === 0;
    const isLastAction = currentMinimizedAction === scheduleActions.length - 1;
  
    return (
      <div className="bg-gray-100 border border-gray-300 p-4 mb-4 rounded">
        <div className="flex items-center justify-center mb-2">
          {scheduleActions.length > 1 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentMinimizedAction(prev => prev - 1); }}
              disabled={isFirstAction}
              className={`px-2 py-1 rounded ${isFirstAction ? 'bg-gray-300 cursor-not-allowed' : 'dimension-theme-colored'}`}
            >
              &lt;
            </button>
          )}
          <h4 className="text-md font-medium mx-4">
            {localHabitData.habit_action && localHabitData.habit_action.length > 0 
              ? `"${localHabitData.habit_action}"` + ` `
              : ''
            }Action #
            {`${currentMinimizedAction + 1}`}
          </h4>
          {scheduleActions.length > 1 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentMinimizedAction(prev => prev + 1); }}
              disabled={isLastAction}
              className={`px-2 py-1 rounded ${isLastAction ? 'bg-gray-300 cursor-not-allowed' : 'dimension-theme-colored'}`}
            >
              &gt;
            </button>
          )}
        </div>
        <select
          value={action.type}
          onChange={(e) => handleActionTypeChange(action.id, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {localHabitData.habit_frequencyPeriod === 'daily' && (
        <>
          <div className="mb-4 flex justify-center items-center flex-wrap">
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleActionSchedulerToggle(); }}
                className="px-4 py-2 dimension-theme-colored rounded"
              >
                {showActionScheduler ? 'Hide Habbit Scheduler' : 'Show Habbit Scheduler'}
              </button>
          </div>
          {showActionScheduler && (
            <div className="border border-gray-300 p-4 mt-4 rounded">
              <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Schedule your {localHabitData.habit_frequencyNum} Daily 
                {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                  ? ` "${localHabitData.habit_action}"` 
                  : ''
                } Action(s)
              </h3>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleActionSchedulerMinimize(); }}
                  className="w-6 h-6 flex items-center justify-center dimension-theme-colored"
                >
                  {isActionSchedulerMinimized ? '+' : '-'}
                </button>
              </div>
              <div 
                ref={actionSchedulerContentRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isActionSchedulerMinimized ? 'auto' : '500px' }}
              >
                {isActionSchedulerMinimized 
                  ? renderMinimizedActionScheduler()
                  : scheduleActions.map((action, index) => (
                  <div key={action.id} className="bg-gray-100 border border-gray-300 p-4 mb-4 rounded">
                    <h4 className="text-md font-medium mb-2">
                      {`${index + 1}${getOrdinalSuffix(index + 1)} `}
                      {localHabitData.habit_action && localHabitData.habit_action.length > 0 
                        ? `"${localHabitData.habit_action}" ` 
                        : ''
                      }
                      Action
                    </h4>
                    <select
                      value={action.type}
                      onChange={(e) => handleActionTypeChange(action.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              ))}
              </div>
              {renderDailyScheduler()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HabitScheduler;