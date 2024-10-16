import { v4 as uuidv4 } from 'uuid';

class Goal {
  constructor(
    goal_name = "New goal", 
    goal_emoji = "🏆", 
    goal_type = "challenge", 
    goal_startDate = null,
    goal_completedDate = null, 
    goal_deadline = null, 
    goal_milestones = [], 
    goal_habitData = {}, 
    goal_performanceData = {}, 
    goal_projectData = { tasks: [], percentComplete: 0, taskPercentagesEnabled: false }, 
    goal_subGoals = [], 
    goal_transformationData = { subGoals: [], totalPercentComplete: 0 }, 
    dimensions = {
      Spiritual: false,
      Mental: false,
      Physical: false,
      Social: false,
      Vocational: false,
      Environmental: false
    },
    description = ""
  ) {
    this.goal_name = goal_name;
    this.goal_emoji = goal_emoji;
    this.goal_type = goal_type;
    this.goal_creationDate = new Date();
    this.goal_startDate = goal_startDate;
    this.goal_completedDate = goal_completedDate;
    this.goal_lastUpdated = new Date();
    this.goal_deadline = goal_type !== 'habit' ? goal_deadline : null;
    this.status = "Not Yet Started";
    this.dimensions = dimensions;
    this.description = description; 

    if (this.goal_type === "challenge") {
      this.milestones = Array.isArray(goal_milestones) 
        ? goal_milestones.map(m => new Milestone(m.name, m.emoji, m.status, m.startDate, m.deadline, m.completedDate, m.pre_existing_goal, m.description, m.id))
        : [];
      this.percentComplete = 0;
    }

    if (this.goal_type === "project") {
      this.project_tasks = goal_projectData.tasks.map(t => new ProjectTask(t.name, t.emoji, t.status, t.taskType, t.pre_existing_goal, t.deadline, t.description));
      this.updateProjectStatus();
    }

    if (this.goal_type === "transformation") {
      this.subGoals = goal_transformationData.subGoals.map(g => new SubGoal(g.goal, g.percentOfTransformation));
      this.totalPercentComplete = goal_transformationData.totalPercentComplete || 0;
    }

    if (this.goal_type === "habit") {
      this.habit_action = goal_habitData.habit_action || null;
      this.habit_frequencyNum = goal_habitData.habit_frequencyNum || null;
      this.habit_frequencyPeriod = goal_habitData.habit_frequencyPeriod || null;
      this.habit_numCompleteInCurrentPeriod = 0;
      this.habit_current_streakNum = 0;
      this.habit_streakEnabled = false;
      this.habit_goal_streakNum = goal_habitData.habit_goal_streakNum || null;
      this.habit_streakPeriod = goal_habitData.habit_streakPeriod || null;
      this.habit_actionUpdates = [];
      this.percentComplete = 0;
    }

    if (this.goal_type === "performance") {
      this.performance_metric = goal_performanceData.performance_metric || null;
      this.performance_unit = goal_performanceData.performance_unit || null;
      this.performance_unitIsPrefix = goal_performanceData.performance_unitIsPrefix || false;
      this.performance_startingValue = goal_performanceData.performance_startingValue || null;
      this.performance_targetValue = goal_performanceData.performance_targetValue || null;
      this.performance_valueHistory = goal_performanceData.performance_valueHistory || [];
      this.percentComplete = 0;
      this.percentImprovement = 0;
  }
  }

  updateStatus(newStatus) {
    if (["Not Yet Started", "In Progress", "Completed"].includes(newStatus)) {
      if (this.goal_type === "project") {
        this.updateProjectStatus(newStatus);
      } else {
        this.status = newStatus;
      }

      if (newStatus === "In Progress" && !this.goal_startDate) {
        this.goal_startDate = new Date();
      } else if (newStatus === "Completed") {
        if (!this.goal_startDate) {
          this.goal_startDate = new Date();
        }
        this.goal_completedDate = new Date();
        this.goal_deadline = null;
      } else if (newStatus === "Not Yet Started") {
        this.goal_startDate = null;
        this.goal_completedDate = null;
      }

      // Update milestones, project tasks, or sub-goals based on the goal type
      if (this.goal_type === "challenge") {
        this.updateMilestones(newStatus);
      } else if (this.goal_type === "project") {
        this.updateProjectTasks(newStatus);
      } else if (this.goal_type === "transformation") {
        this.updateSubGoals(newStatus);
      }
    } else {
      throw new Error("Invalid status. Must be 'Not Yet Started', 'In Progress', or 'Completed'.");
    }
  }

  updateMilestones(newStatus) {
    if (newStatus === "Completed") {
      this.milestones.forEach(milestone => {
        if (!milestone.completed) {
          milestone.completed = true;
          milestone.milestone_completedDate = new Date();
        }
      });
    } else if (newStatus === "Not Yet Started") {
      this.milestones.forEach(milestone => {
        milestone.milestone_startDate = null;
        milestone.completed = false;
        milestone.milestone_completedDate = null;
      });
    }
  }

  updateProjectTasks(newStatus) {
    if (newStatus === "Completed") {
      this.project_tasks.forEach(task => {
        if (task.status !== "Completed") {
          task.setStatus("Completed");
          task.completedDate = new Date();
        }
      });
    } else if (newStatus === "Not Yet Started") {
      this.project_tasks.forEach(task => {
        task.setStatus("Not Yet Started");
        task.startDate = null;
        task.completedDate = null;
      });
    }
  }

  updateSubGoals(newStatus) {
    if (newStatus === "Completed") {
      this.subGoals.forEach(subGoal => {
        if (subGoal.goal.status !== "Completed") {
          subGoal.goal.updateStatus("Completed");
        }
      });
    } else if (newStatus === "Not Yet Started") {
      this.subGoals.forEach(subGoal => {
        subGoal.goal.updateStatus("Not Yet Started");
      });
    }
  }

  updateProjectStatus(requestedStatus = null) {
    if (this.goal_type !== "project") {
      return;
    }

    const hasActiveOrCompletedTasks = this.project_tasks.some(task => 
      task.taskType === "Pre-Existing Goal" && 
      (task.pre_existing_goal.status === "In Progress" || task.pre_existing_goal.status === "Completed")
    );

    if (hasActiveOrCompletedTasks) {
      this.status = "In Progress";
    } else if (requestedStatus) {
      this.status = requestedStatus;
    } else if (this.status === "Not Yet Started") {
      // Keep the current status if it's already "Not Yet Started"
      return;
    } else {
      this.status = "Not Yet Started";
    }
  }

  addProjectTask(task) {
    if (this.goal_type === "project") {
      this.project_tasks.push(task);
      this.updateProjectStatus();
    }
  }

  removeProjectTask(taskIndex) {
    if (this.goal_type === "project" && taskIndex >= 0 && taskIndex < this.project_tasks.length) {
      this.project_tasks.splice(taskIndex, 1);
      this.updateProjectStatus();
    }
  }

  updateProjectTask(taskIndex, updatedTask) {
    if (this.goal_type === "project" && taskIndex >= 0 && taskIndex < this.project_tasks.length) {
      this.project_tasks[taskIndex] = updatedTask;
      this.updateProjectStatus();
    }
  }
  updateFromTool(tool, entry) {
    switch (this.goal_type) {
      case "habit":
        this.updateHabitFromTool(tool, entry);
        break;
      case "performance":
        this.updatePerformanceFromTool(tool, entry);
        break;
      // Add cases for other goal types as needed
    }
    this.calculateProgress();
  }
  updateHabitFromTool(tool, entry) {
    // Logic to update habit based on tool entry
    // This will depend on the specific tool and habit structure
    // For example, for a running tool:
    if (tool.name === "Workout Planner" && entry.activity === "running") {
      this.habit_numCompleteInCurrentPeriod += 1;
    }
  }

  updatePerformanceFromTool(tool, entry) {
    // Logic to update performance goal based on tool entry
    // For example, for a running tool:
    if (tool.name === "Workout Planner" && entry.activity === "running") {
      this.performance_valueHistory.push({
        date: entry.timestamp,
        value: entry.distance // assuming the entry includes distance
      });
    }
  }
}
  
class Milestone {
  constructor(name, emoji = "🏆", status = "Not Yet Started", startDate = null, deadline = null, completedDate = null, pre_existing_goal = null, description = "", id = null) {
    this.id = id || uuidv4();
    this.name = name;
    this.milestone_Emoji = emoji;
    this.milestone_Type = pre_existing_goal ? "Pre-Existing Goal" : "Milestone";
    this.status = status
    this.milestone_startDate = startDate;
    this.hasDeadline = !!deadline;
    this.deadline = deadline;
    this.milestone_completedDate = completedDate;
    this.pre_existing_goal = pre_existing_goal;
    this.description = description;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    if (newStatus === "In Progress") {
      this.milestone_startDate = this.milestone_startDate || new Date().toISOString();
    } else if (newStatus === "Completed") {
      if (!this.milestone_startDate) {
        this.milestone_startDate = new Date().toISOString();
      }
      this.milestone_completedDate = new Date().toISOString();
      this.hasDeadline = false;
      this.deadline = null;
    } else if (newStatus === "Not Yet Started") {
      this.milestone_startDate = null;
      this.milestone_completedDate = null;
    }
  }

  setDeadline(deadline) {
    if (this.status !== "Completed") {
      this.hasDeadline = true;
      this.deadline = deadline;
    }
  }

  removeDeadline() {
    this.hasDeadline = false;
    this.deadline = null;
  }
}

class ProjectTask {
  constructor(name, emoji = "📋", status = "Not Yet Started", taskType = "New Task", pre_existing_goal = null, deadline = null, description = "") {
    this.name = name;
    this.emoji = emoji;
    this.status = status;
    this.taskType = taskType;
    this.pre_existing_goal = pre_existing_goal;
    this.deadline = deadline;
    this.description = description;
    this.startDate = null;
    this.completedDate = null;
  }

  setStatus(newStatus) {
    if (["Not Yet Started", "In Progress", "Completed"].includes(newStatus)) {
      this.status = newStatus;
      if (newStatus === "In Progress" && !this.startDate) {
        this.startDate = new Date();
      } else if (newStatus === "Completed") {
        if (!this.startDate) {
          this.startDate = new Date();
        }
        this.completedDate = new Date();
      } else if (newStatus === "Not Yet Started") {
        this.startDate = null;
        this.completedDate = null;
      }
    } else {
      throw new Error("Invalid status. Must be 'Not Yet Started', 'In Progress', or 'Completed'.");
    }
  }
}

class SubGoal {
  constructor(goal, percentOfTransformation, lockedPercent = false) {
    this.goal = goal instanceof Goal ? goal : new Goal(goal);
    this.percentOfTransformation = percentOfTransformation;
    this.lockedPercent = lockedPercent;
  }

  updateStatus(newStatus) {
    this.goal.updateStatus(newStatus);
  }
    adjustSubGoalPercentages() {
        const totalLockedPercentage = this.subGoals.filter(subGoal => subGoal.lockedPercent).reduce((sum, subGoal) => sum + subGoal.percentOfTransformation, 0);
        const unlockedSubGoals = this.subGoals.filter(subGoal => !subGoal.lockedPercent);
        const remainingPercent = 100 - totalLockedPercentage;
        const equalPercent = remainingPercent / unlockedSubGoals.length;
      
        unlockedSubGoals.forEach(subGoal => {
          subGoal.percentOfTransformation = equalPercent;
        });
      
        this.totalPercentComplete = this.subGoals.reduce((sum, subGoal) => sum + (subGoal.percentOfTransformation), 0);
      }      
}

const formatPerformanceValue = (value, unit, isPrefix, shortenLongNums = true) => {
  let formattedValue = value;

  if (typeof value === 'number') {
    if(shortenLongNums){
      const formatNumber = (n, divisor, suffix) => {
        const result = n / divisor;
        const integerPart = Math.floor(result);
        return integerPart >= 100 ? 
          Math.round(result) + suffix :
          result.toFixed(1) + suffix;
      };
  
      if (value >= 1e12) {
        formattedValue = formatNumber(value, 1e12, 'T');
      } else if (value >= 1e9) {
        formattedValue = formatNumber(value, 1e9, 'B');
      } else if (value >= 1e6) {
        formattedValue = formatNumber(value, 1e6, 'M');
      } else if (value >= 1e3) {
        formattedValue = formatNumber(value, 1e3, 'K');
      }
    } else {
      formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

  }

  if (isPrefix) {
    return `${unit}${formattedValue}`;
  } else {
    return `${formattedValue} ${unit}`;
  }
};

export function calculateProgress(goal) {
  switch (goal.goal_type) {
    case "challenge":
      return calculateChallengeProgress(goal);
    case "project":
      return calculateProjectProgress(goal);
    case "transformation":
      return calculateTransformationProgress(goal);
    case "habit":
      return calculateHabitProgress(goal);
    case "performance":
      return calculatePerformanceProgress(goal);
    default:
      return 0;
  }
}

export function calculateChallengeProgress(goal) {
  const completedMilestones = goal.milestones.filter(m => m.status === "Completed").length;
  goal.percentComplete = (completedMilestones / goal.milestones.length) * 100;
  return goal.percentComplete;
}

export function calculateProjectProgress(goal) {
  const completedTasks = goal.project_tasks.filter(t => t.status === "Completed").length;
  goal.percentComplete = (completedTasks / goal.project_tasks.length) * 100;
  return goal.percentComplete;
}

export function calculateTransformationProgress(goal) {
  goal.totalPercentComplete = goal.subGoals.reduce((sum, subGoal) => {
    const subGoalProgress = subGoal.goal.percentComplete * (subGoal.percentOfTransformation / 100);
    return sum + subGoalProgress;
  }, 0);
  goal.percentComplete = goal.totalPercentComplete;
  return goal.percentComplete;
}

export function calculateHabitProgress(goal) {
  if (goal.habit_frequencyNum && goal.habit_frequencyPeriod) {
    goal.percentComplete = (goal.habit_numCompleteInCurrentPeriod / goal.habit_frequencyNum) * 100;
  } else {
    goal.percentComplete = 0;
  }
  return goal.percentComplete;
}

export function calculatePerformanceProgress(goal) {
  if (goal.performance_startingValue !== null && goal.performance_targetValue !== null) {
    const totalChange = goal.performance_targetValue - goal.performance_startingValue;
    const currentValue = goal.performance_valueHistory.length > 0 
      ? goal.performance_valueHistory[goal.performance_valueHistory.length - 1].value 
      : goal.performance_startingValue;
    const currentChange = currentValue - goal.performance_startingValue;

    goal.percentComplete = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;
    goal.percentImprovement = goal.performance_startingValue !== 0 
      ? (currentChange / Math.abs(goal.performance_startingValue)) * 100 
      : 0;
  } else {
    goal.percentComplete = 0;
    goal.percentImprovement = 0;
  }
  return goal.percentComplete;
}


export { Goal, Milestone, ProjectTask, SubGoal, formatPerformanceValue};