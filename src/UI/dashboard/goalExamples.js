export const goalExamples = {
  challenge: {
    Spectrum: "Complete a 30-day personal growth challenge",
    Sol: "Attend a 10-day silent meditation retreat",
    Amber: "Complete an advanced mindfulness course",
    Red: "Complete a triathlon",
    Violet: "Organize a large-scale charity event",
    Jean: "Start a side business and make first sale",
    Ivy: "Reduce household waste by 50% in 3 months"
  },
  habit: {
    Spectrum: "Meditate for 10 minutes daily",
    Sol: "Pray or meditate for 15 minutes every morning",
    Amber: "Solve a brain teaser or puzzle daily",
    Red: "Do 20 push-ups every morning",
    Violet: "Call a friend or family member daily",
    Jean: "Spend 30 minutes on professional development daily",
    Ivy: "Use a reusable water bottle and coffee cup daily"
  },
  performance: {
    Spectrum: "Increase daily meditation time",
    Sol: "Deepen meditation practice",
    Amber: "Improve IQ test score",
    Red: "Increase maximum weightlifting capacity",
    Violet: "Increase number of meaningful conversations per week",
    Jean: "Increase productivity at work",
    Ivy: "Reduce personal carbon footprint"
  },
  project: {
    Spectrum: "Develop a personal growth mobile app",
    Sol: "Create a meditation garden",
    Amber: "Develop a brain-training app",
    Red: "Create a home gym",
    Violet: "Organize a community festival",
    Jean: "Develop a business plan for a startup",
    Ivy: "Create a community garden"
  },
  transformation: {
    Spectrum: "Become a well-rounded individual",
    Sol: "Become a spiritual mentor",
    Amber: "Become a critical thinker",
    Red: "Become an athlete",
    Violet: "Become a community leader",
    Jean: "Become an entrepreneur",
    Ivy: "Become an environmental activist"
  }
};

export const getRandomExample = (goalType, dimension) => {
  return goalExamples[goalType][dimension] || "Set a goal";
};
