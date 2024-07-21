class Goal {
    constructor(goal_name = "New goal", goal_emoji = "🏆", goal_type = "challenge", goal_startDate = new Date(), goal_deadline = null, goal_milestones = [], goal_habitData = {}, goal_performanceData = {}, goal_projectData = {tasks: [], percentComplete: 0}, goal_subGoals = []) {
        this.goal_name = goal_name;
        this.goal_emoji = goal_emoji;
        this.goal_type = goal_type;
        this.goal_startDate = goal_startDate;
        this.goal_lastUpdated = goal_startDate;
        this.goal_deadline = goal_type !== 'habit' ? goal_deadline : null;

        if(this.goal_type == "challenge") {
            this.milestones = goal_milestones.map(m => new Milestone(m.name, m.emoji, m.started, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal));
            this.percentComplete = 0;
        }

        if(this.goal_type == "habit") {
            this.habit_action = goal_habitData.habit_action || null;
            this.habit_frequencyNum = goal_habitData.habit_frequencyNum || null;
            this.habit_frequencyPeriod = goal_habitData.habit_frequencyPeriod || null;
            this.habit_numCompleteInCurrentPeriod = 0;
            this.habit_current_streakNum = 0;
            this.habit_goal_streakNum = goal_habitData.habit_goal_streakNum || null;
            this.habit_streakPeriod = goal_habitData.habit_streakPeriod || null;
            this.percentComplete = 0;
        }

        if(this.goal_type == "performance") {
            this.performance_metric = goal_performanceData.performance_metric || null;
            this.performance_unit = goal_performanceData.performance_unit || null;
            this.performance_startingValue = goal_performanceData.performance_startingValue || null;
            this.performance_targetValue = goal_performanceData.performance_targetValue || null;
            this.performance_valueHistory = goal_performanceData.performance_valueHistory || [];
            this.percentComplete = 0;
            this.percentImprovement = 0;
        }

        if(this.goal_type == "project") {
            this.project_tasks = goal_projectData.tasks.map(t => new ProjectTask(t.name, t.emoji, t.status, t.taskType, t.pre_existing_goal, t.deadline, t.percentOfProject));
            this.percentComplete = goal_projectData.percentComplete || 0;
            this.adjustTaskPercentages();
        }

        if(this.goal_type == "transformation") {
            this.subGoals = goal_subGoals.map(g => new Goal(g));
            this.percentComplete = 0;
        }
    }

    adjustTaskPercentages() {
        const unmodifiedTasks = this.project_tasks.filter(task => task.percentOfProject === 0);
        const totalModifiedPercent = this.project_tasks.reduce((sum, task) => sum + task.percentOfProject, 0);
        const remainingPercent = 100 - totalModifiedPercent;
        const equalPercent = remainingPercent / unmodifiedTasks.length;

        unmodifiedTasks.forEach(task => {
            task.percentOfProject = equalPercent;
        });

        this.percentComplete = this.project_tasks.reduce((sum, task) => sum + (task.status === "Done" ? task.percentOfProject : 0), 0);
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
    constructor(name, emoji = "📋", status = "To Do", taskType = "New Task", pre_existing_goal = null, deadline = null, percentOfProject = 0, description = "") {
        this.name = name;
        this.emoji = emoji;
        this.status = status;
        this.taskType = taskType;
        this.pre_existing_goal = pre_existing_goal;
        this.deadline = deadline;
        this.percentOfProject = percentOfProject;
        this.description = description; 
    }
}



export { Goal, Milestone, ProjectTask };