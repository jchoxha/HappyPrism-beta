import { v4 as uuidv4 } from 'uuid';

class Tool {
  constructor(name, emoji, dimension, color) {
    this.id = uuidv4();
    this.name = name;
    this.emoji = emoji;
    this.dimension = dimension;
    this.color = color;
    this.linkedGoals = [];
    this.data = [];
  }

  linkGoal(goal) {
    if (!this.linkedGoals.some(g => g.id === goal.id)) {
      this.linkedGoals.push(goal);
    }
  }

  unlinkGoal(goalId) {
    this.linkedGoals = this.linkedGoals.filter(g => g.id !== goalId);
  }

  addData(entry) {
    this.data.push({
      ...entry,
      timestamp: new Date(),
      id: uuidv4()
    });
    this.updateLinkedGoals(entry);
  }

  updateLinkedGoals(entry) {
    this.linkedGoals.forEach(goal => {
      if (goal.autoUpdate) {
        // Call a method on the goal to update it based on the tool's data
        goal.updateFromTool(this, entry);
      }
    });
  }

  // Method to get data within a date range
  getDataInRange(startDate, endDate) {
    return this.data.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }
}

export default Tool;