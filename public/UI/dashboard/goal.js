class Goal {
    constructor(goal_name = "New goal", goal_emoji = "🏆", goal_type = "challenge", goal_startDate = new Date(), goal_deadline = null, goal_milestones = [], goal_habitData = {}, goal_performanceData = [], goal_projectData = {}, goal_subGoals = []) {
        this.goal_name = goal_name;
        this.goal_emoji = goal_emoji;
        this.goal_type = goal_type;
        this.goal_startDate = goal_startDate;
        this.goal_lastUpdated = goal_startDate;
        this.goal_deadline = goal_deadline;

        //A challenge is a goal with a specific objective in mind
        //This challenge may be broken down into milestones that act as precursor steps
        //The challenge and its milestones may be time constrained, but do not have to be
        //If time constrained, the challenge and/or milestones will have an associated deadline property
        //Milestones may be marked as completed or skipped before moving on to the next sub challenge or completing the challenge goal itself
        //Based on the number of milestones completed, the challenge goal may have a progress percentage
        if(this.goal_type == "challenge") {
            this.milestones = goal_milestones.map(m => new Milestone(m.name, m.emoji, m.type, m.startDate, m.deadline, m.completed, m.completedDate, m.pre_existing_goal));
            //milestone propertes:
            // 1. pre_existing_goal: Null if not a pre-existing goal, otherwise the goal object
            // 2. if pre_existing_goal is null: milestone_name: Name of the milestone
            // 2. deadline: Null if no deadline, otherwise the deadline date
            // 3. completed: False if not completed, true if completed
            this.percentComplete = 0;//This value needs to be changed to a percentage based on the number of milestones completed out of the total number of milestones
        }

        //A habit goal has 3 components:
        // 1. A habit action (example: "exercise")
        // 2. A frequency, which is number of times within a give period (example: "5 times weekly" or "once daily")
        // 3. A streak, which is the number of consecutive days/weeks/months or longer for the habit to be maintained (example: "for 30 days" or "for 6 months")
        //The habit goal may have a progress percentage based on how long the streak has been maintained
        if(this.goal_type == "habbit") {
            this.habbit_action = null;
            this.habbit_frequencyNum = null;
            this.habbit_frequencyPeriod = null;
            this.habbit_numCompleteInCurrentPeriod = 0; // Example: If the frequency is "5 times weekly", this will be the number of times the habit has been completed this week
            this.habbit_current_streakNum = null; // Example: If the streak is "for 30 days", this will be the number of days the habit has been completed in a row
            this.habbit_goal_streakNum = null; // Example: If the streak is "for 30 days", this will be 30
            this.habbit_streakPeriod = this.habbit_frequencyPeriod; // Example: If the frequency is "5 times weekly", this will be the number of weeks the habit has been completed 5 times
            this.percentComplete = 0; //This value needs to be changed to a percentage based on the number of {habbit_streakPeriod} the habit has been completed {habbit_frequencyNum} times in a row. Example: If the frequency is "5 times weekly" and the streak is "for 30 days", the percentage will be the number of weeks the habit has been completed 5 times, in a row divided by the total number of weeks in 30 days
        }

        //A performance goal is at the most basic, a goal with the objective of improving performance over time
        //This goal type does not necessarily have a specific objective, but it can (example: "Increase bench press" vs "Increase bench press to 200 lbs")
        //If this goal has a specific objective, it can also have a deadline (example: "Increase bench press to 200 lbs by end of year")
        //The performance goal may have a progress percentage based on the improvement made over time
        if(this.goal_type == "performance") {
            this.performance_metric = null; //Name of the metric to be improved
            this.performance_unit = null; //Unit of the metric to be improved
            this.performance_startingValue = null; //Starting value of the metric
            this.performance_valueHistory = []; //Array of objects with date and value properties
            this.performance_targetValue = null; //Target value of the metric, if it has one
            this.percentComplete = 0; //Null if no target value, otherwise the percentage of the target value that has been achieved
            this.percentImprovement = 0; //The percentage improvement from the starting value to the last entered value
        }

        //A project goal is a goal that has specific tasks to be completed in order to achieve the goal
        //Similar to challenge goal, however the tasks in a project goal are better organized between 3 categories: "To Do", "In Progress", and "Done"
        //All task must be completed before the goal can be achieved
        //Each task has an associated percentage that represents its portion of the project goal
        //As new tasks are added, the percentage of the other tasks may be adjusted to maintain a total of 100%
        //The project as well as its tasks may have deadlines
        //Based on the number of tasks completed, the project goal may have a progress percentage
        if(this.goal_type == "project") {
            this.project_tasks = {
                "To Do": [],
                "In Progress": [],
                "Done": []
            };//All task objects have a name, description, optional deadline, and contributingPercentage property.
                //ContributingPercentage is the percentage of the total project goal that the task represents
            this.percentTodo = 100; //This value is computed as the sum of the contributingPercentage of all tasks in the "To Do" category
            this.percentInProgress = 0; //This value is computed as the sum of the contributingPercentage of all tasks in the "In Progress" category
            this.percentComplete = 0; //This value is computed as the sum of the contributingPercentage of all tasks in the "Done" category
        }

        //A transformation goal is a goal that is focused on changing certain aspects of the individual in a positive way
        //These goals are often open ended, and modified over time
        //These goals are typically long term and may not have a specific deadline, but their progress over time is tracked
        //These goals are measured as a percentage, with the percentage calculated based on the progress made in linked sub-goals
        //These sub goals can be from any other category of goal, including transformation goals
        //For example, a transformation goal to "Become Physically Fit" may have sub-goals for "Complete a marathon" (challenge goal), "Exercise Daily for 30 days" (habbit goal), "Lower body fat to 15%" (performance goal), "Finish Home Gym" (Project Goal), and "Become Knowledgeable about Fitness" (Transformation Goal) etc.
        //Each of these sub-goals will have a progress percentage, and the transformation goal will have a progress percentage based on the average of the sub-goals
        if(this.goal_type == "transformation") {
            this.subGoals = []; //Each subGoal must be its own pre-existing goal object. Each subGoal also has an additional contributingPercentage property
            this.percentComplete = 0; //This value is computed as the percent complete of each subGoal multiplied by the contributingPercentage of each subGoal, then added together
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

export { Goal, Milestone };