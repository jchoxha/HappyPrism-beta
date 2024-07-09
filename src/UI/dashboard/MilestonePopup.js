import React from 'react';
import { format } from 'date-fns';

const MilestonePopup = ({ milestone, onClose }) => {
  const getStatus = () => {
    if (milestone.completed) return "Completed";
    if (milestone.milestone_started) return "In Progress";
    return "Not Started";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">{milestone.milestone_Emoji} {milestone.name}</h3>
        <p>{milestone.milestone_Type}</p>
        {milestone.milestone_started && (
          <p><strong>Start Date:</strong> {format(milestone.milestone_startDate, 'PP')}</p>
        )}
        {milestone.deadline && <p><strong>Deadline:</strong> {format(milestone.deadline, 'PP')}</p>}
        <p><strong>Status:</strong> {getStatus()}</p>
        {milestone.completed && milestone.milestone_completedDate && (
          <p><strong>Completed Date:</strong> {format(milestone.milestone_completedDate, 'PP')}</p>
        )}
        {milestone.pre_existing_goal && <p><strong>Linked to:</strong> {milestone.pre_existing_goal.goal_name}</p>}
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MilestonePopup;
