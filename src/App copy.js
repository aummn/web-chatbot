import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState([]);
  const [isButtonDisabled, setButtonDisabled] = useState(false);  // State to track button enabled/disabled

  const handleQuestionChange = (event) => {
      setQuestion(event.target.value);
  };

  const handleSubmit = async () => {
      setButtonDisabled(true);  // Disable the button when the request is sent
      try {
          const response = await axios.post('http://localhost:5000/ask', { question });
          const lines = response.data.answer.split('\n');
          const filteredLines = lines.filter(line => line.trim() !== '');
          setAnswer(filteredLines);
      } catch (error) {
          console.error('Error making Axios request:', error);
          setAnswer(['Error: Unable to retrieve data.']);
      }
      setButtonDisabled(false);  // Enable the button again after receiving the response
  };

  return (
      <div className="App">
          <header className="App-header">
              <h1>Q/A Chatbot</h1>
              <input type="text" value={question} onChange={handleQuestionChange} placeholder="Ask a question" />
              <button onClick={handleSubmit} disabled={isButtonDisabled}>Submit</button>
              <div>
                  {answer.map((item, index) => (
                      <p key={index}>{item}</p>
                  ))}
              </div>
          </header>
      </div>
  );
}


export default App;
