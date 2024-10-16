export const getSuggestEmojiPrompt = (goalType, goalName, goalDescription) => `
Based on the following name and description for a ${goalType} goal, suggest an emoji to represent it. If there are multiple strong possible choices for an emoji, please pick one of them at random. Do not return any text besides one suggested emoji.

Goal Name: "${goalName}"
Goal Description: "${goalDescription}"
`;