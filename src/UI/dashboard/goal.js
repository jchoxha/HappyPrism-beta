import { v4 as uuidv4 } from 'uuid';

class Goal {
  constructor(goal_name = "New goal", goal_emoji = "🏆", goal_type = "challenge", goal_startDate = null, goal_deadline = null, goal_milestones = [], goal_habitData = {}, goal_performanceData = {}, goal_projectData = {tasks: [], percentComplete: 0, taskPercentagesEnabled: false}, goal_subGoals = [], goal_transformationData = { subGoals: [], totalPercentComplete: 0 }, dimensions = {
    Spiritual: false,
    Mental: false,
    Physical: false,
    Social: false,
    Vocational: false,
    Environmental: false
  }) {
    this.goal_name = goal_name;
    this.goal_emoji = goal_emoji;
    this.goal_type = goal_type;
    this.goal_startDate = null;
    this.goal_completedDate = null;
    this.goal_lastUpdated = new Date();
    this.goal_deadline = goal_type !== 'habit' ? goal_deadline : null;
    this.status = "Not Yet Started";
    this.dimensions = dimensions;

    if (this.goal_type === "challenge") {
      this.milestones = goal_milestones.map(m => new Milestone(m.name, m.emoji, m.started, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal, m.id));
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
      this.habit_goal_streakNum = goal_habitData.habit_goal_streakNum || null;
      this.habit_streakPeriod = goal_habitData.habit_streakPeriod || null;
      this.percentComplete = 0;
    }

    if (this.goal_type === "performance") {
      this.performance_metric = goal_performanceData.performance_metric || null;
      this.performance_unit = goal_performanceData.performance_unit || null;
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
        milestone.milestone_started = false;
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
}
  


class Milestone {
  constructor(name, emoji = "🏆", started = false, startDate = null, deadline = null, completed = false, completedDate = null, pre_existing_goal = null, id = null) {
    this.id = id || uuidv4();
    this.name = name;
    this.milestone_Emoji = emoji;
    this.milestone_Type = pre_existing_goal ? "Pre-Existing Goal" : "Milestone";
    this.milestone_started = started;
    this.milestone_startDate = startDate;
    this.deadline = deadline;
    this.completed = completed;
    this.milestone_completedDate = completedDate;
    this.pre_existing_goal = pre_existing_goal;
  }

  updateStatus(newStatus) {
    if (newStatus === "In Progress") {
      this.milestone_started = true;
      if (!this.milestone_startDate) {
        this.milestone_startDate = new Date();
      }
    } else if (newStatus === "Completed") {
      this.completed = true;
      if (!this.milestone_completedDate) {
        this.milestone_completedDate = new Date();
      }
    } else if (newStatus === "Not Yet Started") {
      this.milestone_started = false;
      this.milestone_startDate = null;
      this.completed = false;
      this.milestone_completedDate = null;
    }
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
  


export { Goal, Milestone, ProjectTask, SubGoal };