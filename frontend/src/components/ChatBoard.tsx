import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Define TypeScript interfaces
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface TaskOperation {
  id: string;
  operation: string;
  task_data?: any;
  timestamp: Date;
  status: 'pending' | 'success' | 'error';
}

// Component to display tasks from list_tasks operation
const TasksDisplay: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <h4 className="font-medium text-gray-700">Tasks:</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border ${
              task.is_complete
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h5 className="font-medium truncate">{task.title}</h5>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{task.description}</p>
                )}
              </div>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                task.is_complete
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {task.is_complete ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Task {
  id: number;
  title: string;
  description: string;
  is_complete: boolean;
}

interface ChatApiResponse {
  response: string;
  conversation_id: number;
  task_operations: Array<{
    operation: string;
    status: string;
    result?: {
      tasks?: Task[];
    };
    task_data?: any;
  }>;
}

interface ChatBoardProps {
  className?: string;
}

const ChatBoard: React.FC<ChatBoardProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [taskOperations, setTaskOperations] = useState<TaskOperation[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number>(0); // Start with 0 until first interaction
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to execute MCP tools based on task operations
  const executeMcpTools = async (operations: Array<{operation: string, status: string, result?: {tasks?: Task[]}, task_data?: any}>) => {
    for (const op of operations) {
      // Create a temporary ID for this operation to track its status
      const tempOpId = `temp-${Date.now()}-${Math.random()}`;

      // Add pending operation to state
      const newTaskOp: TaskOperation = {
        id: tempOpId,
        operation: op.operation,
        task_data: op.result?.tasks || op.task_data, // Prioritize tasks from result if available
        timestamp: new Date(),
        status: 'pending'
      };

      setTaskOperations(prev => [...prev, newTaskOp]);

      try {
        // Simulate MCP tool execution based on operation type
        switch(op.operation) {
          case 'add_task':
            // Assuming there's an MCP tool for adding tasks
            console.log('Executing add_task:', op.task_data);
            // Example: await MCP.perform('add_task', op.task_data);
            break;
          case 'update_task':
            // Assuming there's an MCP tool for updating tasks
            console.log('Executing update_task:', op.task_data);
            // Example: await MCP.perform('update_task', op.task_data);
            break;
          case 'complete_task':
            // Assuming there's an MCP tool for completing tasks
            console.log('Executing complete_task:', op.task_data);
            // Example: await MCP.perform('complete_task', op.task_data);
            break;
          case 'delete_task':
            // Assuming there's an MCP tool for deleting tasks
            console.log('Executing delete_task:', op.task_data);
            // Example: await MCP.perform('delete_task', op.task_data);
            break;
          case 'list_tasks':
            // Handle the result from list_tasks operation
            console.log('Executing list_tasks, received tasks:', op.result?.tasks);
            // Update the task_data to include the tasks from result
            setTaskOperations(prev =>
              prev.map(item =>
                item.id === tempOpId ? {...item, task_data: op.result?.tasks, status: 'success'} : item
              )
            );
            continue; // Skip the general success update since we already updated it
          default:
            console.log('Unknown operation:', op.operation);
        }

        // Update task operation status to success
        setTaskOperations(prev =>
          prev.map(item =>
            item.id === tempOpId ? {...item, status: 'success'} : item
          )
        );
      } catch (error) {
        console.error(`Error executing operation ${op.operation}:`, error);

        // Update task operation status to error
        setTaskOperations(prev =>
          prev.map(item =>
            item.id === tempOpId ? {...item, status: 'error'} : item
          )
        );
      }
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to state immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get JWT token from auth context
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare request payload
      const requestBody = {
        message: userMessage.text,
        conversation_id: conversationId,
      };

      // Call the backend API
      // const response = await fetch('http://127.0.0.1:8000/api/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(requestBody),
      // });

      // if (!response.ok) {
      //   throw new Error(`API request failed with status ${response.status}`);
      // }
      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  }
);

if (!response.ok) {
  throw new Error(`API request failed with status ${response.status}`);
}


      const data: ChatApiResponse = await response.json();

      // Update conversation ID if received
      if (data.conversation_id !== undefined) {
        setConversationId(data.conversation_id);
      }

      // Process task operations if any
      if (data.task_operations && data.task_operations.length > 0) {
        // Execute MCP tools for each operation (this will update the task operations state)
        await executeMcpTools(data.task_operations);
      }

      // Add bot response to messages
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Delete a single message or task operation
  const handleDeleteItem = (id: string, type: 'message' | 'task') => {
    if (type === 'message') {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } else {
      setTaskOperations(prev => prev.filter(op => op.id !== id));
    }
  };

  // Clear entire chat
  const handleClearChat = () => {
    setMessages([]);
    setTaskOperations([]);
    setConversationId(0); // Reset conversation ID
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="glass-card p-4 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">AI Todo Assistant</h2>
        <button
          onClick={handleClearChat}
          className="glass-button px-3 py-1.5 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 border-red-500/30 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages and Task Operations Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/10 backdrop-blur-sm rounded-b-2xl">
        {messages.length === 0 && taskOperations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            Start a conversation with the AI assistant...
          </div>
        ) : (
          <>
            {/* Render messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] relative group ${message.sender === 'user'
                    ? 'bg-violet-500 text-white rounded-br-none rounded-2xl'
                    : 'bg-white/80 text-gray-800 rounded-bl-none rounded-2xl'}`}
                >
                  <div className="p-3 whitespace-pre-wrap break-words">
                    {message.text}
                  </div>

                  {/* Delete button - for all messages and visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(message.id, 'message');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                    aria-label="Delete message"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* Render task operations */}
            {taskOperations.map((operation) => {
              // Check if task_data contains tasks (array of Task objects)
              const hasTasks = operation.task_data && Array.isArray(operation.task_data) && operation.task_data.length > 0 && typeof operation.task_data[0]?.id !== 'undefined';

              return (
                <div
                  key={operation.id}
                  className="flex justify-center"
                >
                  <div
                    className={`max-w-[80%] relative group bg-blue-100 text-blue-800 rounded-2xl border-l-4 ${
                      operation.status === 'success' ? 'border-green-500' :
                      operation.status === 'error' ? 'border-red-500' : 'border-blue-500'
                    }`}
                  >
                    <div className="p-3 whitespace-pre-wrap break-words">
                      <div className="font-medium capitalize">
                        {operation.operation.replace('_', ' ')}:
                      </div>

                      {/* If operation is list_tasks and has tasks, display them nicely */}
                      {operation.operation === 'list_tasks' && hasTasks && (
                        <TasksDisplay tasks={operation.task_data} />
                      )}

                      {/* For other operations or when task_data is not an array of tasks */}
                      {!hasTasks && operation.task_data && (
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {JSON.stringify(operation.task_data, null, 2)}
                        </pre>
                      )}

                      <div className="text-xs mt-1 opacity-70">
                        {operation.status === 'success' ? '✓ Success' :
                         operation.status === 'error' ? '✗ Error' : 'Processing...'}
                      </div>
                    </div>

                    {/* Delete button for task operations */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(operation.id, 'task');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                      aria-label="Delete task operation"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Loading indicator when bot is typing */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 text-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card p-4 mt-4 rounded-2xl">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="glass-input flex-1 resize-none py-2 px-4 rounded-xl min-h-[60px] max-h-32 focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={1}
            disabled={isLoading || !isAuthenticated}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim() || !isAuthenticated}
            className={`glass-button px-4 py-2 rounded-xl flex items-center justify-center ${
              isLoading || !inputValue.trim() || !isAuthenticated
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-white/90'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-violet-600"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        {!isAuthenticated && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Please log in to use the chat
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBoard;


