'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Send, User, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 5});
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="fixed top-0 w-full bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Files</span>
          </button>
          <button 
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Upload New File
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-16 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 py-8">
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`flex space-x-3 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div 
                  className={`flex max-w-[80%] ${
                    m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div 
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      m.role === 'user' ? 'bg-blue-100 ml-2' : 'bg-gray-100 mr-2'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <User className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div 
                    className={`p-4 rounded-lg ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    {m.content.length > 0 ? (
                      <ReactMarkdown 
                        className={`prose ${
                          m.role === 'user' ? 'prose-invert' : ''
                        } max-w-none`}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="italic text-sm opacity-75">
                        {m?.toolInvocations?.[0]?.toolName && (
                          <div>Tool: {m.toolInvocations[0].toolName}</div>
                        )}
                        {m?.toolInvocations?.[0]?.state && (
                          <div>State: {m.toolInvocations[0].state}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 w-full bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
            />
            <button 
              type="submit"
              className="absolute right-3 p-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}