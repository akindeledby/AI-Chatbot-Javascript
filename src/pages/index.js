import React from "react";
import Style from "../styles/index.module.css";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import Head from "next/head";

// We can use a helper library to help stream the API as response is being generated character by character. So, we will install the eventsource-parser library
import { createParser } from "eventsource-parser";

const SYSTEM_MESSAGE =
  "I am an AI-ChatBot, a helpful and versatile AI created by Akindele using state-of-the-art machine learning models and APIs.";
// SYSTEM_MESSAGE IS VERY IMPORTANTT AND USEFUL AS IT WILL STILL BE USED TO CREATE PROMPT ENGINEERING IN FURTHER TASKS.

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  // const [botMessage, setBotMessage] = useState(""); // This codeline is optional
  const [userMessage, setUserMessage] = useState("");

  // We will define a Usestate function that will help us keep the state of the messages and send it to ChatGPT
  // and we can put in a SYSTEM_MESSAGE which we have defined above as the defualt message which first appears to the user.
  const [messages, setMessages] = useState([
    { role: "System", content: SYSTEM_MESSAGE },
  ]);

  // By using the code below, we would be able to display whatever is typed in the console
  {
    /*function handleTyping(e) {
    setUserMessage(e.target.value); // We can set this directly into the onChange property of the textArea and totally remove the function handleTyping
    console.log('Typing:', e.target.value);
  }
*/
  }

  const API_URL = "https://api.openai.com/v1/chat/completions";

  const sendRequest = async () => {
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setUserMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMessages,
          stream: true,
        }),
      });

      const reader = response.body.getReader();

      let newMessage = "";
      const parser = createParser((event) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            return;
          }
          const json = JSON.parse(event.data);
          const content = json.choices[0].delta.content;

          if (!content) {
            return;
          }

          newMessage += content;

          const updatedMessages2 = [
            ...updatedMessages,
            { role: "assistant", content: newMessage },
          ];

          setMessages(updatedMessages2);
        } else {
          return "";
        }
      });

      // eslint-disable-next-line
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        parser.feed(text);
      }
    } catch (error) {
      console.error("error");
      window.alert("Error:" + error.message);
    }
  };

  return (
    <>
      <Head>
        <title>AI-Chatbot: Your friendly AI Assistant</title>
      </Head>

      <div className="flex flex-col h-screen">
        {/* Navbar */}
        <nav className="bg-white shadow p-1 flex flex-row justify-between items-center">
          <div className="text-xl font-bold">Welcome to AI-ChatBot</div>
          <div>
            <input
              // size={30}
              type="password"
              className="border rounded p-1"
              placeholder="Enter API key.."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)} // This line will help us grab the value entered into the api kep box and save it in a variable called "value"
              // We can decide to view the API value by logging it in the console using console.log("apikey:", apiKey);
            />
          </div>
        </nav>

        {/*So, within the message history block, we can use JSX code to dynanamically take the messages as handles by the useState and display the messages into the message
        We can also re-format our code to use "You" in place of "User" and "AI-ChatBot" in place of "System" that is displayed in the chat history using the Tenary Operator.
        // we will add the "overflow-y-scroll" so as to make the message space alone to scroll up and down 
        {/* Message History */}

        <div className="flex-1 overflow-y-scroll">
          <div className="w-full max-w-screen-md mx-auto p-4">
            {messages
              .filter((message) => message.role !== "System")
              .map((message, idx) => (
                <div key={idx} className="my-3">
                  <div className="font-bold text-lg">
                    {message.role === "User" ? "You" : "AI-ChatBot"}
                  </div>
                  <div className="text-lg prose">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              //onChange = {handleTyping}

              // So, when the user click on the "Send" button, we would fire/activate the sendRequest function.
              className="border text-lg rounded-md p-1 flex-1"
              rows={1}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-20 p-2 ml-2"
              onClick={sendRequest}
            >
              Send
            </button>
          </div>
        </div>

        {/*<div className='p-4'>
              <button className='border rounded-md p-2 bg-blue-500 hover:bg-blue-600' onClick={sendRequest}>Send Request</button>
            </div>
            <div className='text-lg mt-4'>{botMessage}</div>
            {/* Add more UI here */}
      </div>
    </>
  );
}
