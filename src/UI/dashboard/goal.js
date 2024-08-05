class Goal {
    constructor(goal_name = "New goal", goal_emoji = "🏆", goal_type = "challenge", goal_startDate = new Date(), goal_deadline = null, goal_milestones = [], goal_habitData = {}, goal_performanceData = {}, goal_projectData = {tasks: [], percentComplete: 0, taskPercentagesEnabled: false}, goal_subGoals = [], goal_transformationData = { subGoals: [], totalPercentComplete: 0 }) {
      this.goal_name = goal_name;
      this.goal_emoji = goal_emoji;
      this.goal_type = goal_type;
      this.goal_startDate = goal_startDate;
      this.goal_lastUpdated = goal_startDate;
      this.goal_deadline = goal_type !== 'habit' ? goal_deadline : null;
      this.status = "Not Yet Started";
  
      if (this.goal_type === "challenge") {
        this.milestones = goal_milestones.map(m => new Milestone(m.name, m.emoji, m.started, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal));
        this.percentComplete = 0;
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
  
      if (this.goal_type === "project") {
        this.project_tasks = goal_projectData.tasks.map(t => new ProjectTask(t.name, t.emoji, t.status, t.taskType, t.pre_existing_goal, t.deadline, t.description));
      }
  
      if (this.goal_type === "transformation") {
        this.subGoals = goal_transformationData.subGoals.map(g => new SubGoal(g.goal, g.percentOfTransformation));
        this.totalPercentComplete = goal_transformationData.totalPercentComplete || 0;
      }
    }
    updateStatus(newStatus) {
      if (["Not Yet Started", "In Progress", "Completed"].includes(newStatus)) {
        this.status = newStatus;
      } else {
        throw new Error("Invalid status. Must be 'Not Yet Started', 'In Progress', or 'Completed'.");
      }
    }
  }
  


class Milestone {
    constructor(name, emoji = "🏆", started = false, startDate = null, deadline = null, completed = false, completedDate = null, pre_existing_goal = null) {
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
  }

  setStatus(newStatus) {
      if (["Not Yet Started", "In Progress", "Completed"].includes(newStatus)) {
          this.status = newStatus;
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