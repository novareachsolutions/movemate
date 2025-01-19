import React, {useState} from 'react';
import ChatModule from '../components/ChatModule';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hi, Johnathon',
      sender: 'receiver' as const, // Explicitly cast to union type
      time: '12:56 PM',
      senderImage: 'https://i.pravatar.cc/100',
    },
    {id: '2', text: 'Hey, Yes', sender: 'user' as const, time: '12:57 PM'},
    {
      id: '3',
      text: 'How can I help you?',
      sender: 'receiver' as const,
      time: '12:58 PM',
      senderImage: 'https://i.pravatar.cc/100',
    },
    {
      id: '4',
      text: 'I need some assistance with my order.',
      sender: 'user' as const,
      time: '12:59 PM',
    },
  ]);

  const handleSend = (message: string) => {
    const newMessage = {
      id: `${messages.length + 1}`,
      text: message,
      sender: 'user' as const, // Explicitly cast to union type
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([newMessage, ...messages]);
  };

  return (
    <ChatModule
      messages={messages}
      onSend={handleSend}
      headerTitle="Alexander V."
      onReport={() => console.log('Report pressed')}
    />
  );
};

export default ChatScreen;
