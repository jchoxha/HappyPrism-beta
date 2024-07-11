// chatai.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} = require('@google/generative-ai');
const { ca } = require('date-fns/locale');
const Sentiment = require('sentiment');
import { response } from 'express';
import { showCanvasUI } from '../canvas/CanvasUI.js';
import agentPrompts from './prompts.js';

const genAI = new GoogleGenerativeAI("AIzaSyB2JPYGICXfdp3uKJ3xve0Wp-zJh2cdulM");
const safety_settings = [
    {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    ];


class ChatAI {
    constructor(options) {
        this.options = Object.assign({
            api_key: '',
            source: 'Google',
            model: 'gemini-1.5-flash',
            conversations: [],
            selected_conversation: null,
            container: '.chat-ai',
            chat_speed: 30,
            title: 'HappyPrism',
            max_tokens: 1000,
            version: '1.0.0',
            show_tokens: true,
            available_models: ['gemini-1.5-flash'],
            safety_settings: safety_settings,
            onClose: null,
        }, options);
        this.sidebarDisabled = true;
        this.agentNames= ["Spectrum", "Sol", "Amber", "Red", "Violet", "Jean", "Ivy"]
        this.initialize();

        this.render_options = {
            current_response_buttons: [],

        }
    }

        
    initialize() {
        this.options.container.style.display = "flex";
        this.options.container.innerHTML = 
        /*HTML*/
        `
            <button id="close-chat-button" class="activatable-button">
                <img src="./Images/UI/close.svg" alt="close">
            </button>
            ${this._sidebarTemplate()}
            <div class="content" id="chat-content">
                ${this._welcomePageTemplate()}
                <div class="response-buttons-container" id="chat-response-buttons-container">
                    <div class="response-buttons" id="chat-response-buttons"></div>
                </div>
                <form class="message-form" id="chat-message-form">
                    <textarea type="text" placeholder="Send a message to Spectrum..." id="chat-textarea" required></textarea>
                    <button type="submit" id="chat-submit-button"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        `;
        
        this.handleWelcomeEvents();
        let settings = this.getSettings();
        if (settings) {
            this.options = Object.assign(this.options, settings);
        }
        this._eventHandlers();
        this._setupCloseChatButton();
        updateChatRender();
        window.addEventListener('resize', updateChatRender); 
    }

    _setupCloseChatButton() {
        const closeButton = this.options.container.querySelector('#close-chat-button');
        if (closeButton) {
            closeButton.addEventListener('click', this.handleCloseChatButton.bind(this));
        }
    }

    handleCloseChatButton(event) {
        event.preventDefault();
        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    redraw() {
        //this.initialize();
        this.options.container.style.display = "flex";
    }


    createResponseButtons() {
        const responseContainer = this.container.querySelector('.response-buttons-container');
        responseContainer.innerHTML = '<div class="response-buttons" id="chat-response-buttons"></div>';
        const responseButtons = this.container.querySelector('.response-buttons');
    
        if (!responseContainer || !responseButtons) {
            console.error('Response container or buttons not found');
            return;
        }
    
        // Clear previous buttons
        const conversation = this.selectedConversation;
        const interaction = conversation.interactions[conversation.interactions.length - 1];
        const buttons = interaction.responseOptions;
    
        buttons.forEach(buttonText => {
            const button = document.createElement('button');
            button.textContent = buttonText;
            button.onclick = () => this.handleResponseButtonClick(buttonText);
            responseButtons.appendChild(button);
        });
    
        // Add scrolling functionality
        this.addScrollButtons(responseContainer, responseButtons);
        if(buttons.length == 0){
            responseContainer.innerHTML = '';
        }
        updateChatRender();
    }
    
    handleScrollButtonState(buttonsContainer, leftArrow, rightArrow) {
    //     const maxScrollLeft = buttonsContainer.scrollWidth - buttonsContainer.clientWidth;
    //     if (buttonsContainer.scrollLeft === 0) {
    //         leftArrow.disabled = true;
    //     } else {
    //         leftArrow.disabled = false;
    //     }
    //     if (buttonsContainer.scrollLeft >= maxScrollLeft) {
    //         rightArrow.disabled = true;
    //     } else {
    //         rightArrow.disabled = false;
    //     }
    }
    
    addScrollButtons(container, buttonsContainer) {
        // Remove any existing scroll buttons to avoid duplicates
        const existingLeftArrow = container.querySelector('#left-arrow');
        const existingRightArrow = container.querySelector('#right-arrow');
        if (existingLeftArrow) existingLeftArrow.remove();
        if (existingRightArrow) existingRightArrow.remove();
    
        const leftArrow = document.createElement('button');
        leftArrow.className = 'scroll-button';
        leftArrow.id = 'left-arrow';
        leftArrow.innerHTML = '&lt;'; // or use an image/icon
        leftArrow.onclick = () => this.scrollResponseButtons(buttonsContainer, -1);
    
        const rightArrow = document.createElement('button');
        rightArrow.className = 'scroll-button';
        rightArrow.id = 'right-arrow';
        rightArrow.innerHTML = '&gt;'; // or use an image/icon
        rightArrow.onclick = () => this.scrollResponseButtons(buttonsContainer, 1);
    
        container.appendChild(leftArrow);
        container.appendChild(rightArrow);
    
        // Initial call to handle the state of scroll buttons
        this.handleScrollButtonState(buttonsContainer, leftArrow, rightArrow);
    
        // Add event listener to update scroll buttons state on scroll
        buttonsContainer.addEventListener('scroll', () => {
            this.handleScrollButtonState(buttonsContainer, leftArrow, rightArrow);
        });
    }
    
    // Modify the scrollResponseButtons function to call handleScrollButtonState after scrolling
    scrollResponseButtons(buttonsContainer, direction) {
        const scrollAmount = 200; // Adjust based on your preference
        buttonsContainer.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    
        // Delay to ensure scroll is complete before checking state
        setTimeout(() => {
            const leftArrow = document.querySelector('#left-arrow');
            const rightArrow = document.querySelector('#right-arrow');
            this.handleScrollButtonState(buttonsContainer, leftArrow, rightArrow);
        }, 300);
    }

    clearResponseButtons() {
        const responseContainer = this.container.querySelector('.response-buttons-container');
        responseContainer.innerHTML = '<div class="response-buttons" id="chat-response-buttons"></div>';
    }
    

    handleResponseButtonClick(response) {
        const input = this.container.querySelector('.message-form textarea');
        input.value = response;
        this.container.querySelector('.message-form').dispatchEvent(new Event('submit'));
    }

    // generateResponseOptions(botMessage) {
    //     // Logic to generate response options based on the bot's message content
    //     // This is a simple example, you can enhance it based on your specific needs
    //     if (botMessage.includes('')) {
    //         return ["Tell me more about goals", "How can I set a goal?", "Give me an example of a goal"];
    //     } else if (botMessage.includes('wellness')) {
    //         return ["What are the dimensions of wellness?", "How can I improve my wellness?", "Tell me more about wellness"];
    //     } else {
    //         return null;
    //     }
    // }


    async getMessage() {
        this.container.querySelector('.content .messages').scrollTop = this.container.querySelector('.content .messages').scrollHeight;
        const conversation = this.selectedConversation;
        const interaction = conversation.interactions[conversation.interactions.length-1]
       
        let msg = "Hello."
        if(interaction.messages.length > 0) { msg = interaction.messages[interaction.messages.length - 1].content;}
        this.clearResponseButtons()
        const history = [
            ...interaction.messages.map(message => ({
            role: message.role, 
            parts: [{ text: message.content}],
            }))
        ]
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            apiVersion: "v1beta",
            systemInstruction: conversation.systemInstruction
        });
        const chat = model.startChat({
            history: history,
            generationConfig: {
              maxOutputTokens: this.maxTokens,
            },
            safetySettings: this.safety_settings,
        });
        let retryCount = 0;
        let success = false;
    
        while (retryCount < 3 && !success) {
            try {
                const result = await chat.sendMessageStream(msg);
                success = true;
    
                this.container.querySelector('.message.assistant.active .blink').remove();
                let msgElement = this.container.querySelector('.message.assistant.active .text');
                let text = "";
                let totalText = "";
                let responsesStarted = false;
    
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    totalText += chunkText;
                    
                    if (chunkText.includes("§") && !responsesStarted) {
                        const parts = chunkText.split("§");
    
                        msgElement.innerHTML += parts[0].replace(/(?:\r\n|\r|\n)/g, '<br>');
                        text += parts[1];
                        responsesStarted = true;
                    }
    
                    if (!responsesStarted) {
                        msgElement.innerHTML += chunkText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                }
    
                if(totalText.includes("§")) {
                    let responseText = totalText.slice(totalText.indexOf("§") + 1);
                    const responseLines = responseText.split('\n');
                    responseLines.shift();
                    const responseOptions = [];
                    const responseItemRegex = /^\d+-\s*(.*)$/;
    
                    for (const responseLine of responseLines) {
                        const responseMatch = responseLine.match(responseItemRegex);
                        if (responseMatch) {
                            const newOption = responseMatch[1].trim();
                            const forbiddenSubstrings = ["(", ")", "...", "[", "]", "{", "}"];
                            if (!forbiddenSubstrings.some(substring => newOption.includes(substring))) {
                                responseOptions.push(newOption);
                            }
                        }
                    }
                    interaction.responseOptions = responseOptions;
                }
    
                this.container.querySelector('.message-form textarea').disabled = false;
                this.container.querySelector('.message-form textarea').placeholder = `Send a message to ${this.selectedConversation.name}...`;
                const assisstantMessage = this.container.querySelector('.message.assistant.active');
                if (assisstantMessage) {
                    assisstantMessage.classList.remove('active');
                }
    
                interaction.messages.push({
                    role: 'model',
                    content: totalText,
                    date: new Date(),
                    total_tokens: 0,
                    prompt_tokens: 0,
                    completion_tokens: 0
                });
    
                this.createResponseButtons();
                this.container.querySelector('.content .messages').scrollTop = this.container.querySelector('.content .messages').scrollHeight;
                //FUNCTION TRIGGERS
                {
                if(totalText.includes("onnecting you to " + this.agentNames[0])
                    || totalText.includes("onnecting you to " + this.agentNames[1])
                    || totalText.includes("onnecting you to " + this.agentNames[2])
                    || totalText.includes("onnecting you to " + this.agentNames[3])
                    || totalText.includes("onnecting you to " + this.agentNames[4])
                    || totalText.includes("onnecting you to " + this.agentNames[5])
                    || totalText.includes("onnecting you to " + this.agentNames[6])
                ){


                    //The following code extracts the word immediately after the trigger phrase, then makes sure it is one of the accepted values before calling the function
                    const triggerPhrase = "onnecting you to "
                    const startIndex = totalText.indexOf("onnecting you to ");
                    if (startIndex !== -1) {
                        // Calculate the start position of the word after the trigger phrase
                        const wordStartIndex = startIndex + triggerPhrase.length;
                        // Get the substring from the word start index to the end of the message
                        const remainingMessage = totalText.substring(wordStartIndex).trim();
                        // Split the remaining message to get the first word
                        const words = remainingMessage.split(" ");
                        // Return the first word
                        const agentName = words[0];
                    
                        console.log("openAgentChat triggered");
                        setTimeout(async () => {  
                            interaction.messages.push({
                                role: 'system',
                                content: `openChat triggered, opening chat with ${agentName}`,
                                date: new Date(),
                                total_tokens: 0,
                                prompt_tokens: 0,
                                completion_tokens: 0
                            });
                            // Update context
                            this.selectedConversation.contextSummary = await this.getContextSummary(this.selectedConversation);
                        
                            // Update system instruction
                            this.selectedConversation.systemInstruction = await this.getSystemInstruction(this.selectedConversation.name, "FollowUp", this.selectedConversation.contextSummary);
                        
                            // Create a new interaction for our current conversation so the user starts with that interaction next time they come back to this conversation
                            this.selectedConversation.interactions.push(await this.createNewInteraction());
                        
                            // Create desiredConversation variable, assign it to selectedConversation for type consistency
                            let desiredConversation = this.selectedConversation;
                        
                            // Immediately reassign to a conversation with the triggered agent name
                            if (desiredConversation = this.conversations.find(conversation => conversation.name === agentName)) {
                                this.loadConversation(desiredConversation);
                            }
                            // If we couldn't find a conversation with the triggered agent name, create one
                            else {
                                await this.createNewConversation(agentName);
                                this.loadConversation(this.conversations.find(conversation => conversation.name === agentName));
                            }
                        }, 1000);
                    }
                }
                if(totalText.includes("et's look at your goal: ")){
                    console.log("openGoalTracker triggered");
                    //The following code extracts the word immediately after the trigger phrase, then makes sure it is one of the accepted values before calling the function
                    const triggerPhrase = "et's look at your goal: "
                    const startIndex = totalText.indexOf("et's look at your goal: ");
                    if (startIndex !== -1) {
                        // Calculate the start position of the word after the trigger phrase
                        const goalNameStartIndex = startIndex + triggerPhrase.length;
                        // Get the substring from the word start index to the end of the message
                        if (totalText[goalNameStartIndex] !== '"') {
                            console.log("No opening quotation mark found.");
                        }
                        let goalNameEndIndex = totalText.indexOf('"', goalNameStartIndex + 1);
                    
                        if (goalNameEndIndex === -1) {
                            return "No closing quotation mark found.";
                        }
                    
                        console.log("Goal name: ",totalText.slice(goalNameStartIndex + 1, goalNameEndIndex));
                    
                        
                    }
                }
                }
            } catch (error) {
                console.error(error);
                this.container.querySelector('.content .messages').innerHTML = '';
                this.container.querySelector('.response-buttons-container').innerHTML = '<div class="response-buttons" id="chat-response-buttons"></div>';
                this.container.querySelector('.message-form textarea').disabled = false;
                this.container.querySelector('.message-form textarea').placeholder = `Send a message to ${this.selectedConversation.name}...`;
                this.showErrorMessage("There has been an error, please try sending a different message.");
            }
        }
    }
    



    async getJsonFile() {
        try {
            let [fileHandle] = await window.showOpenFilePicker();
            let file = await fileHandle.getFile();
            let fileContents = await file.text();
            let jsonObject = JSON.parse(fileContents);
            return { content: jsonObject, name: file.name };
        } catch (error) {
            if (error.code !== DOMException.ABORT_ERR) {
                console.error('Error reading JSON file:', error);
                this.showErrorMessage(error.message);
            }
        }
    }

    async saveJsonToFile(jsonObject) {
        try {
            let options = {
                suggestedName: 'ai-conversations.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            };
            let handle = await window.showSaveFilePicker(options);
            let writable = await handle.createWritable();
            let jsonString = JSON.stringify(jsonObject, null, 2);
            await writable.write(jsonString);
            await writable.close();
            this.options.title = handle.name;
            this.updateTitle(false);
            this.showSuccessMessage('File saved successfully.');
        } catch (error) {
            if (error.code !== DOMException.ABORT_ERR) {
                console.error('Error saving JSON file:', error);
                this.showErrorMessage(error.message);
            }
        }
    }

    showErrorMessage(message) {
        this.container.querySelectorAll('.error').forEach(error => error.remove());
        let error = document.createElement('div');
        error.classList.add('error-toast');
        error.innerHTML = message;
        this.container.appendChild(error);
        error.getBoundingClientRect();
        error.style.transition = 'opacity .5s ease-in-out 4s';
        error.style.opacity = 0;
        setTimeout(() => error.remove(), 5000);
    }

    showSuccessMessage(message) {
        this.container.querySelectorAll('.success').forEach(success => success.remove());
        let success = document.createElement('div');
        success.classList.add('success-toast');
        success.innerHTML = message;
        this.container.appendChild(success);
        success.getBoundingClientRect();
        success.style.transition = 'opacity .5s ease-in-out 4s';
        success.style.opacity = 0;
        setTimeout(() => success.remove(), 5000);
    }

    formatElapsedTime(dateString) {
        let date = new Date(dateString);
        let now = new Date();
        let elapsed = now - date;
        let seconds = Math.floor(elapsed / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        if (days > 1) {
            return `${days} days ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (hours > 0) {
            return `${hours} hours ago`;
        } else if (minutes > 0) {
            return `${minutes} minutes ago`;
        } else {
            return `${seconds} seconds ago`;
        }
    }

    loadConversation(conversation) {
        this.clearWelcomeScreen();
        this.clearMessages();
        this.clearResponseButtons();
        this.container.querySelector('.content .conversation-title').innerHTML = 
        
        /*HTML*/`
            <h2><span class="text">${conversation.name}</span><i class="fa-solid fa-pencil edit"></i><i class="fa-solid fa-trash delete"></i></h2>

        `;
        this._conversationTitleClickHandler();
        this.createResponseButtons();
        this.container.querySelector('.message-form textarea').placeholder = `Send a message to ${conversation.name}...`
        
        conversation.interactions.forEach(interaction => {
            interaction.messages.forEach(message => {
                if(message.role != "system"){
                //Remove any suggested responses
                let content = message.content.split('§')[0];
                
                this.container.querySelector('.content .messages').insertAdjacentHTML('afterend', 
                    /*HTML*/`
                    <div class="message ${message.role == 'model' ? 'assistant' : 'user'}">
                        <div class="wrapper">
                            <div class="avatar">${message.role == 'model' ? 'AI' : '<i class="fa-solid fa-user"></i>'}</div>
                            <div class="details">
                                <div class="date" title="${message.date}">${this.formatElapsedTime(message.date)}</div>
                                <div class="text">
                                    ${content.replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/```(.*?)```/, "<pre><code>$1" + "<" + "/code>" + "<" + "/pre>")}
                                    ${this.options.show_tokens && message.total_tokens ? '<div><span class="tokens">' + message.total_tokens + ' Tokens</span></div>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                }
            });
        });
    }

    clearWelcomeScreen() {
        if (this.container.querySelector('.content .welcome')) {
            this.container.querySelector('.content .welcome').remove();
            this.container.querySelector('.content').insertAdjacentHTML('afterbegin', '<div class="conversation-title" id="chat-conversation-title"></div><div class="messages" id="chat-messages"></div>');
            return true;
        }
        return false;
    }

    clearMessages() {
        if (this.container.querySelector('.content .messages')) {
            this.container.querySelector('.content .messages').innerHTML = '';
            return true;
        }
        return false;
    }

    async createNewConversation(agentName = null) {
        agentName = agentName != null ? agentName : 'Spectrum';
        let interactionsArray = []

        let contextSummary = "";
        let promptName = "Initial";
        
        const conversation = this.conversations.find(previousConversation => previousConversation.name === agentName);
        if(conversation){
            contextSummary = await this.getContextSummary(conversation);
            promptName = "FollowUp";
        }
        let systemInstruction = await this.getSystemInstruction(agentName, promptName, contextSummary);
        interactionsArray.push(await this.createNewInteraction(agentName));
        let index = this.conversations.push({ name: agentName, interactions: interactionsArray, systemInstruction: systemInstruction, contextSummary: contextSummary});
        console.log(this.conversations);
        // this.container.querySelectorAll('.conversations .list a').forEach(c => c.classList.remove('selected'));
        // this.container.querySelector('.conversations .list').insertAdjacentHTML('beforeend', `<a class="conversation selected" href="#" data-id="${index - 1}" title="${agentName}"><i class="fa-regular fa-message"></i>${agentName}</a>`);
        this.clearWelcomeScreen();
        this.clearMessages();
        this._conversationClickHandlers();
        this.container.querySelector('.content .conversation-title').innerHTML = '<h2><span class="text">' + agentName + '</span><i class="fa-solid fa-pencil edit"></i><i class="fa-solid fa-trash delete"></i></h2>';
        this._conversationTitleClickHandler();
        this.container.querySelector('.message-form textarea').placeholder = `Send a message to ${agentName}...`
        this.updateTitle();
        return index - 1;
    }

    async getSystemInstruction(agentName, promptName, contextSummary) {
        const agent = agentPrompts.find(agent => agent.agentName === agentName);
        if (!agent) {
          throw new Error(`Agent ${agentName} not found`);
        }
    
        const prompt = agent.prompts.find(prompt => prompt.promptName === promptName);
        if (!prompt) {
          throw new Error(`Prompt ${promptName} not found for agent ${agentName}`);
        }
    
        let text = prompt.promptText;
        console.log("System Instruction: ", text);
        if (contextSummary.length > 0) {
          return text + "\n\n" + contextSummary;
        }
        return text;
      }

    async createNewInteraction(agentName = null) {
        //Set default values for first time running the program
        agentName = agentName != null ? agentName : 'Spectrum';
        let currentInteraction = null;
        let conversation = null;
        let promptName = "Initial";

        conversation = this.conversations.find(previousConversation => previousConversation.name === agentName);
        if(conversation){
            const currentInteractionIndex = conversation.interactions.length - 1;
            currentInteraction = conversation.interactions[currentInteractionIndex];
            promptName = "FollowUp";
        }

        const newInteraction = { messages: [], responseOptions: []};

        console.log(`New ${promptName} interaction with ${agentName} created.`);
        return newInteraction;
    }

    async getContextSummary(conversation) {
        const getPrompt = await fetch(`./Prompts/Summarizer/prompt.txt`);
        const summarizerInstructions = await getPrompt.text();
        const summarizerModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            apiVersion: "v1beta",
            systemInstruction: summarizerInstructions
        });
       let previousContext = `*PREVIOUS CONTEXT BETWEEN USER AND ${conversation.name}*\n\n`;
       previousContext += conversation.contextSummary;

        const currentInteraction = conversation.interactions[conversation.interactions.length - 1];
        const messages = currentInteraction.messages;
    
        // Create the transcript
        let transcript = `*TRANSCRIPT BETWEEN USER AND ${conversation.name}*\n\n`;
        messages.forEach(message => {
            const role = message.role === 'user' ? 'USER' : 'ASSISTANT';
            transcript += `${role}: ${message.content}\n\n`;
        });
    
        // Create history with the single transcript message
        const history = [
            {
                role: 'user',
                parts: [{ text: previousContext }],
            },
            {
                role: 'user',
                parts: [{ text: transcript }],
            }
        ];
    
        const chat = summarizerModel.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: this.maxTokens,
            },
            safetySettings: this.safety_settings,
        });
    
        const msg = "Create a summary of this conversation so far.";
        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();
        console.log("Context Summary: ", text);
        return text;
    }
    


    updateTitle(unsaved = true) {
        //document.title = unsaved ? '* ' + this.options.title.replace('* ', '') : this.options.title.replace('* ', '');
    }

    modal(options) {
        let element;
        if (document.querySelector(options.element)) {
            element = document.querySelector(options.element);
        } else if (options.modalTemplate) {
            document.body.insertAdjacentHTML('beforeend', options.modalTemplate());
            element = document.body.lastElementChild;
        }
        options.element = element;
        options.open = obj => {
            element.style.display = 'flex';
            element.getBoundingClientRect();
            element.classList.add('open');
            if (options.onOpen) options.onOpen(obj);
        };
        options.close = obj => {
            if (options.onClose) {
                let returnCloseValue = options.onClose(obj);
                if (returnCloseValue !== false) {
                    element.style.display = 'none';
                    element.classList.remove('open');
                    element.remove();
                }
            } else {
                element.style.display = 'none';
                element.classList.remove('open');
                element.remove();
            }
        };
        if (options.state == 'close') {
            options.close({ source: element, button: null });
        } else if (options.state == 'open') {
            options.open({ source: element }); 
        }
        element.querySelectorAll('.modal-close').forEach(e => {
            e.onclick = event => {
                event.preventDefault();
                options.close({ source: element, button: e });
            };
        });
        return options;
    }

    openSettingsModal() {
        let self = this;
        return this.modal({
            state: 'open',
            modalTemplate: function () {
                /*HTML*/
                return `
                <div class="chat-ai-modal">
                    <div class="content">
                        <h3 class="heading">Settings<span class="modal-close">&times;</span></h3>
                        <div class="body">
                            <form class="settings-form" action="">
                                <label for="api_key">API Key</label>
                                <input type="text" name="api_key" id="api_key" value="${self.APIKey}">
                                <label for="source">Source</label>
                                <select name="source" id="source">
                                    <option value="openai" selected>OpenAI</option>
                                </select>
                                <label for="model">Model</label>
                                <select name="model" id="model">
                                    ${self.options.available_models.map(m => `<option value="${m}"${self.model==m?' selected':''}>${m}</option>`).join('')}
                                </select>
                                <label for="max_tokens">Max Tokens</label>
                                <input type="number" name="max_tokens" id="max_tokens" value="${self.maxTokens}">
                                <div class="msg"></div>
                            </form>
                        </div>
                        <div class="footer">
                            <a href="#" class="btn modal-close save">Save</a>
                            <a href="#" class="btn modal-close reset right alt">Reset</a>
                        </div>
                    </div>
                </div>
                `;
            },
            onClose: function (event) {
                if (event && event.button) {
                    if (event.button.classList.contains('save')) {
                        self.APIKey = event.source.querySelector('#api_key').value;
                        self.maxTokens = event.source.querySelector('#max_tokens').value;
                        self.source = event.source.querySelector('#source').value;
                        self.model = event.source.querySelector('#model').value;
                        self.saveSettings();
                    }
                    if (event.button.classList.contains('reset')) {
                        localStorage.removeItem('settings');
                        location.reload();
                    }
                }
            }
        });
    }

    getSettings() {
        return localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')) : false;
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify({ api_key: this.APIKey, max_tokens: this.maxTokens, source: this.source, model: this.model }));
    }

    _welcomePageTemplate() {
        
        return (
        
        /*HTML*/`
            <div class="welcome">
                <h1>
                <div id="chat-logo-and-name">
                    <img id="chat-logo" src="../Images/UI/LogoDarkLargeNoBG.svg">                        
                    <span id="app-name">
                        <span class="chat-app-name-letter">H</span><!--
                        --><span class="chat-app-name-letter">a</span><!--
                        --><span class="chat-app-name-letter">p</span><!--
                        --><span class="chat-app-name-letter">p</span><!--
                        --><span class="chat-app-name-letter">y</span><!--
                        --><span class="chat-app-name-letter">P</span><!--
                        --><span class="chat-app-name-letter">r</span><!--
                        --><span class="chat-app-name-letter">i</span><!--
                        --><span class="chat-app-name-letter">s</span><!--
                        --><span class="chat-app-name-letter">m</span>
                    </span> 
                </div>
                Chat
                <span class="ver">beta</span></h1>                    
                <p>Type your first message below to get started!</p>
            </div>
        `);
    }

    handleWelcomeEvents(){
            //Custom Hover For Home Button
        
            const hoverArea = document.getElementById('chat-logo-and-name');
            const letters = document.getElementsByClassName('chat-app-name-letter');
        
            let letterAnimation;
            let logoAnimation;
        
            function animateLogo() {
            if (logoAnimation) logoAnimation.pause();
            logoAnimation = anime({
                targets: '#chat-logo',
                translateY: [
                    { value: -2.5, duration: 500 },
                    { value: 0, duration: 500 },
                    { value: 2.5, duration: 500 },
                    { value: 0, duration: 500 }
                ],
                easing: 'linear',
                loop: true,
                
            });
            }
        
            function animateLogoBackToDefault() {
            if (logoAnimation) logoAnimation.pause();
            logoAnimation = anime({
                targets: '#chat-logo',
                translateY: 0,
                easing: 'spring(1, 80, 10, 0)',
                duration: 500,
                complete: () => {
                    anime.remove('#chat-logo');
                }
            });
        }
        
        const animateLetters = () => {
        if (letterAnimation) letterAnimation.pause();
        letterAnimation = anime({
            targets: letters,
            color: [
                { value: '#FF0000' }, // Red
                { value: '#FF7F00' }, // Orange
                { value: '#FFFF00' }, // Yellow
                { value: '#00FF00' }, // Green
                { value: '#0000FF' }, // Blue
                { value: '#4B0082' }, // Indigo
                { value: '#9400D3' }, // Violet
                { value: '#f0f0f0' }, // BG Color
            ],
            easing: 'linear',
            duration: 2500,
            loop: 1,
            delay: anime.stagger(100, { start: 0, direction: 'normal' }),
            complete: function() {
                animateLetters();
            },
        });
        };
        
        const animateBackToBlack = () => {
        if (letterAnimation) letterAnimation.pause();
        letterAnimation = anime({
            targets: letters,
            color:  '#000000',
            easing: 'linear',
            duration: 500,
            delay: anime.stagger(100, { start: 0, direction: 'normal' }),
            complete: () => {
                anime.remove(letters);
            }
        });
        };
        
        hoverArea.addEventListener('mouseover', () => {
            animateLogo();
            animateLetters();
        });
        
        hoverArea.addEventListener('mouseout', () => {
            animateLogoBackToDefault()
            animateBackToBlack();
        });
    }

    _sidebarTemplate() {
        /*HTML*/
        return `
            <a href="#" class="open-sidebar" id ="chat-open-sidebar" title="Open Sidebar" ><img src="../../Images/UI/menu.svg" alt="Conversation Menu"></a>
            <nav class="conversations">
                <a class="new-conversation" href="#"><i class="fa-solid fa-plus"></i>New Conversation</a>
                <div class="list"></div>
                <div class="footer">
                    <a class="save" href="#" title="Save"><i class="fa-solid fa-floppy-disk"></i></a>
                    <a class="open-database" href="#"><i class="fa-regular fa-folder-open"></i></a>
                    <a class="settings" href="#"><i class="fa-solid fa-cog"></i></a>
                    <a class="close-sidebar" href="#" title="Close Sidebar"><i class="fa-solid fa-bars"></i></a>
                </div>
            </nav>
        `;
    }

    _conversationClickHandlers() {
        this.container.querySelectorAll('.conversations .list a').forEach(conversation => {
            conversation.onclick = event => {
                event.preventDefault();
                this.container.querySelectorAll('.conversations .list a').forEach(c => c.classList.remove('selected'));
                conversation.classList.add('selected');
                this.selectedConversationIndex = conversation.dataset.id;
                this.selectedConversation = this.conversations[this.selectedConversationIndex];
                this.loadConversation(this.selectedConversation);
                this.container.querySelector('.content .messages').scrollTop = this.container.querySelector('.content .messages').scrollHeight;
            };
        });
    }

    _conversationTitleClickHandler() {
        this.container.querySelector('.conversation-title i.edit').onclick = () => {
            this.container.querySelector('.conversation-title .text').contentEditable = true;
            this.container.querySelector('.conversation-title .text').focus();
            let update = () => {
                this.container.querySelector('.conversation-title .text').contentEditable = false;
                this.selectedConversation.name = this.container.querySelector('.conversation-title .text').innerText;
                this.container.querySelector('.conversation-title .text').blur();
                this.container.querySelector('.conversations .list a[data-id="' + this.selectedConversationIndex + '"]').innerHTML = '<i class="fa-regular fa-message"></i>' + this.selectedConversation.name;
                this.container.querySelector('.conversations .list a[data-id="' + this.selectedConversationIndex + '"]').title = this.selectedConversation.name;
                this.updateTitle();
            };
            this.container.querySelector('.conversation-title .text').onblur = () => update();
            this.container.querySelector('.conversation-title .text').onkeydown = event => {
                if (event.keyCode == 13) {
                    event.preventDefault();
                    update();
                }
            };
        };
        this.container.querySelector('.conversation-title i.delete').onclick = () => {
            if (confirm('Are you sure you want to delete this conversation?')) {
                this.conversations.splice(this.selectedConversationIndex, 1);
                this.selectedConversation = [];
                this.selectedConversationIndex = null;
                this.container.querySelector('.content').innerHTML = '';
                this.container.querySelector('.conversations .list .conversation.selected').remove();
                this.updateTitle();
                if (!this.container.querySelector('.content .welcome')) {
                    this.container.querySelector('.content').insertAdjacentHTML('afterbegin', this._welcomePageTemplate());
                }
                this._openDatabaseEventHandlers();
            }
        };
    }

    _openDatabaseEventHandlers() {
        this.container.querySelectorAll('.open-database').forEach(button => {
            button.onclick = event => {
                event.preventDefault();
                if (document.title.startsWith('*') && !confirm('You have unsaved changes. Continue without saving?')) {
                    return;
                }
                this.getJsonFile().then(json => {
                    if (json !== undefined) {
                        if (this.container.querySelector('.content .messages')) {
                            this.container.querySelector('.content .messages').remove();
                        }
                        if (!this.container.querySelector('.content .welcome')) {
                            this.container.querySelector('.content').insertAdjacentHTML('afterbegin', this._welcomePageTemplate());
                        }
                        this.container.querySelector('.conversations .list').innerHTML = '';
                        this.selectedConversation = [];
                        this.selectedConversationIndex = null;
                        this.conversations = json.content;
                        document.title = json.name;
                        this.options.title = json.name;
                        this.conversations.forEach((conversation, index) => {
                            this.container.querySelector('.conversations .list').insertAdjacentHTML('beforeend', `<a class="conversation" href="#" data-id="${index}" title="${conversation.name}"><i class="fa-regular fa-message"></i>${conversation.name}</a>`);
                        });
                        this._conversationClickHandlers();
                        this._openDatabaseEventHandlers();
                    }
                });
            };
        });
    }

    async _eventHandlers() {
        document.getElementById('chat-textarea').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default action (adding a newline)
                document.querySelector('.message-form').onsubmit(new Event('submit'));
            }
        });
        
        this.container.querySelector('.message-form').onsubmit = async event => {
            event.preventDefault();
            this.clearWelcomeScreen();
            if (this.selectedConversation === undefined) {
                this.sidebarDisabled = true;
                this.selectedConversationIndex = await this.createNewConversation();
                this.selectedConversation = this.conversations[this.selectedConversationIndex];
            }
            if (this.selectedConversation) {
                this.sidebarDisabled = false;

                let date = new Date();
                const conversation = this.selectedConversation
                const interaction = conversation.interactions[conversation.interactions.length-1]
                interaction.messages.push({
                    role: 'user',
                    content: this.container.querySelector('.message-form textarea').value,
                    date: date
                });
                
                const spacers = this.container.querySelectorAll('.chat-spacer');
                spacers.forEach(spacer => spacer.remove());
                this.container.querySelector('.messages').insertAdjacentHTML('afterbegin', 
                    /*HTML*/`
                        <div class="chat-spacer"></div>
                        <div class="message assistant active">
                            <div class="wrapper">
                                <div class="avatar">AI</div>
                                <div class="details">
                                    <div class="date" data-date="${date}" title="${date}">just now</div>
                                    <div class="text"><span class="blink">_</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="message user">
                            <div class="wrapper">
                                <div class="avatar"><i class="fa-solid fa-user"></i></div>
                                <div class="details">
                                    <div class="date" data-date="${date}" title="${date}">just now</div>
                                    <div class="text">${this.container.querySelector('.message-form textarea').value}</div>
                                </div>
                            </div>
                        </div>
                    `);

                updateChatRender()
                this.container.querySelector('.message-form textarea').disabled = true;
                this.getMessage(this.container.querySelector('.message-form textarea').value);
                this.container.querySelector('.message-form textarea').value = '';
                this.updateTitle();
                window.addEventListener('keydown', event => {
                    if (event.ctrlKey && event.key === 's') {
                        event.preventDefault();
                        this.saveJsonToFile(this.conversations);
                    }
                });
                window.addEventListener('beforeunload', event => {
                    if (document.title.startsWith('*') && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        event.preventDefault();
                        event.returnValue = '';
                    }
                });
                this.container.querySelector('.save').onclick = event => {
                    event.preventDefault();
                    this.saveJsonToFile(this.conversations);
                };
                this.container.querySelector('.conversations .new-conversation').onclick = event => {
                    event.preventDefault();
                    this.selectedConversationIndex = this.createNewConversation();
                };
                this.container.querySelector('.open-sidebar').onclick = event => {
                    event.preventDefault();
                    this.container.querySelector('.conversations').style.display = 'flex';
                    this.container.querySelector('.open-sidebar').style.display = 'none';
                    localStorage.setItem('sidebar', 'open');
                };
                this.container.querySelector('.close-sidebar').onclick = event => {
                    event.preventDefault();
                    this.container.querySelector('.conversations').style.display = 'none';
                    this.container.querySelector('.open-sidebar').style.display = 'flex';
                    localStorage.setItem('sidebar', 'closed');
                };
                if (localStorage.getItem('sidebar') === 'closed') {
                    this.container.querySelector('.conversations').style.display = 'none';
                    this.container.querySelector('.open-sidebar').style.display = 'flex';
                }
                this.container.querySelector('.settings').onclick = event => {
                    event.preventDefault();
                    this.openSettingsModal();
                };
                setInterval(() => {
                    this.container.querySelectorAll('[data-date]').forEach(element => {
                        element.innerHTML = this.formatElapsedTime(element.getAttribute('data-date'));
                    });
                }, 120000);
                this._openDatabaseEventHandlers();
                this._conversationClickHandlers();
            }
            const openSidebar = document.querySelector('.open-sidebar');
            if(this.sidebarDisabled){
                openSidebar.style.display = 'none';
            }else{
                openSidebar.style.display = 'flex';
            }
        };
    }


    get APIKey() {
        return this.options.api_key;
    }

    set APIKey(value) {
        this.options.api_key = value;
    }

    get model() {
        return this.options.model;
    }

    set model(value) {
        this.options.model = value;
    }

    get source() {
        return this.options.source;
    }

    set source(value) {
        this.options.source = value;
    }

    get conversations() {
        return this.options.conversations;
    }

    set conversations(value) {
        this.options.conversations = value;
    }

    get selectedConversationIndex() {
        return this.options.selected_conversation;
    }

    set selectedConversationIndex(value) {
        this.options.selected_conversation = value;
    }

    get selectedConversation() {
        return this.conversations[this.selectedConversationIndex];
    }

    set selectedConversation(value) {
        this.conversations[this.selectedConversationIndex] = value;
    } 
    
    get container() {
        return this.options.container;
    }

    set container(value) {
        this.options.container = value;
    }

    get maxTokens() {
        return parseInt(this.options.max_tokens);
    }

    set maxTokens(value) {
        this.options.max_tokens = parseInt(value);
    }

}

let chatInstance = null;
let canvasManager = null;

export function drawChat(CanvasManager = null) {
    canvasManager = CanvasManager;
    console.log(chatInstance);
    if (chatInstance) {
        // If a chat instance already exists, just redraw it
        console.log("Redrawing chat");
        chatInstance.redraw();
    } else {
        // If no chat instance exists, create a new one
        chatInstance = new ChatAI({
            container: document.querySelector('#chat-popup'),
            api_key: 'AIzaSyB2JPYGICXfdp3uKJ3xve0Wp-zJh2cdulM',
            model: 'gemini-1.5-flash',
            onClose: closeChat,
        });
    }

}

export function closeChat() {
    const chatContainer = chatInstance.options.container;
    chatContainer.style.display = 'none';
    showCanvasUI();
}

function updateChatRender() {
    const messageForm = document.querySelector('.message-form');
    const responseButtonsContainer = document.querySelector('.response-buttons-container');
    const responseButtons = document.querySelector('.response-buttons');
    const chatSpacer = document.querySelector('.chat-spacer');

    if (messageForm) {
        let referenceTop;
        if (responseButtonsContainer) {
            if(responseButtons){
                    const leftArrow = document.querySelector('#left-arrow');
                    const rightArrow = document.querySelector('#right-arrow');
                    if (leftArrow && rightArrow) {
                        const totalWidth = responseButtonsContainer.clientWidth;
                        const scrollButtonsWidth = leftArrow.clientWidth + rightArrow.clientWidth;
                        responseButtons.style.width = `${totalWidth - scrollButtonsWidth}px`;
                    }
            }
            const messageFormTop = messageForm.getBoundingClientRect().top;
            responseButtonsContainer.style.bottom = `${window.innerHeight - messageFormTop + 10}px`;
            referenceTop = responseButtonsContainer.getBoundingClientRect().top;
        } else {
            referenceTop = messageForm.getBoundingClientRect().top;
        }
        console.log(referenceTop);
        console.log(window.innerHeight);
        if (chatSpacer) {
            const chatSpacerHeight = window.innerHeight - referenceTop; // Calculate height in pixels
            chatSpacer.style.height = `${chatSpacerHeight}px`;
        }
    }
}



module.exports = { drawChat };