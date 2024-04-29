import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Constants
const MAX_TOKENS = 3000; // backend's token limit

const App = () => {
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const messagesEndRef = useRef(null);

    // Update question state as user types
    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    // Append a new message to the chat history
    const addToChatHistory = (type, text) => {
        setChatHistory(chatHistory => [...chatHistory, { type, text }]);
    };

    // Scroll to the bottom of the chat history whenever it updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Function to create context from recent chat history without exceeding token limit,
    // the context is created from the most recent messages to the earliest ones. 
    // used as input for a model like GPT-4, ensuring that the input does not exceed the model's maximum token limit.
    const createContext = () => {
        let context = '';

        // Fetch all entries and reverse the array to get the messages from the latest to the earliest
        const reversedHistory = chatHistory.slice().reverse();

        for (const message of reversedHistory) {
            let messageText = `${message.text}\n`;
            // Check if adding the next message will exceed the token limit
            if ((context + messageText).length <= MAX_TOKENS) {
                context += messageText;
            } else {
                // If the limit is exceeded, stop adding to the context
                break;
            }
        }
        return context.trim(); // Remove any trailing whitespace
    };

    // Handle the submission of a new question
    const handleSubmit = async () => {
        setButtonDisabled(true); // Disable the button to prevent multiple submissions
        addToChatHistory('question', `You: ${question}`);
        setQuestion(''); // Clear the question input for the next query
        
        // Create context for the current question
        const context = createContext();

        try {
            // Send the question and context to the backend
            const response = await axios.post('http://localhost:5000/ask', { question, context });
            // Add the received answer to the chat history
            addToChatHistory('answer', `System: ${response.data.answer}`);
        } catch (error) {
            console.error('Error making Axios request:', error);
            addToChatHistory('answer', 'System: Error: Unable to retrieve data.');
        }

        setButtonDisabled(false); // Re-enable the button after the response

    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Chatbot</h1>
                <div className="chat-history">
                    {chatHistory.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.type === 'question' ? 'user' : 'system'}`}>
                            {entry.text}
                        </div>
                    ))}
                    {/* Invisible element to enable auto-scrolling */}
                    <div ref={messagesEndRef} />
                </div>
                <input
                    type="text"
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Ask a question..."
                    onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled && handleSubmit()}
                />
                <button onClick={handleSubmit} disabled={isButtonDisabled}>
                    Send
                </button>
            </header>
        </div>
    );
};

export default App;
