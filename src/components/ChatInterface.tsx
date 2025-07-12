import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateResponse } from '../lib/together';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatInterfaceProps {
  refreshTrigger: number;
}

export function ChatInterface({ refreshTrigger }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkDataAvailability();
  }, [refreshTrigger]);

  const checkDataAvailability = async () => {
    try {
      const stockResult = await supabase.from('stock_prices').select('date').limit(1);
      const hasStockData = Boolean(stockResult.data && stockResult.data.length > 0);
      setHasData(hasStockData);
    } catch (error) {
      console.error('Error checking data availability:', error);
      setHasData(false);
    }
  };



  const queryStockData = async (query: string) => {
    // Enhanced keyword-based stock data queries
    const lowerQuery = query.toLowerCase();
    let stockQuery = supabase.from('stock_prices').select('*');

    // Handle date range queries (e.g., "Jan-24 to Mar-24")
    const dateRangeMatch = lowerQuery.match(/(\w{3}-\d{2})\s*(?:to|from)\s*(\w{3}-\d{2})/);
    if (dateRangeMatch) {
      const startDate = dateRangeMatch[1];
      const endDate = dateRangeMatch[2];
      // Convert MMM-YY to proper date format
      const startYear = '20' + startDate.split('-')[1];
      const endYear = '20' + endDate.split('-')[1];
      const monthMap: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      const startMonth = monthMap[startDate.split('-')[0]];
      const endMonth = monthMap[endDate.split('-')[0]];
      
      stockQuery = stockQuery
        .gte('date', `${startYear}-${startMonth}-01`)
        .lte('date', `${endYear}-${endMonth}-31`)
        .order('date', { ascending: true });
    }
    // Handle specific month queries (e.g., "Jan-24")
    else if (lowerQuery.match(/\w{3}-\d{2}/)) {
      const monthMatch = lowerQuery.match(/(\w{3})-(\d{2})/);
      if (monthMatch) {
        const month = monthMatch[1];
        const year = '20' + monthMatch[2];
        const monthMap: { [key: string]: string } = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
          'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        const monthNum = monthMap[month];
        if (monthNum) {
          stockQuery = stockQuery
            .gte('date', `${year}-${monthNum}-01`)
            .lte('date', `${year}-${monthNum}-31`)
            .order('date', { ascending: true });
        }
      }
    }
    // Handle specific query types
    else if (lowerQuery.includes('highest') || lowerQuery.includes('maximum')) {
      stockQuery = stockQuery.order('high', { ascending: false }).limit(10);
    } else if (lowerQuery.includes('lowest') || lowerQuery.includes('minimum')) {
      stockQuery = stockQuery.order('low', { ascending: true }).limit(10);
    } else if (lowerQuery.includes('average') || lowerQuery.includes('avg')) {
      stockQuery = stockQuery.order('date', { ascending: false }).limit(30);
    } else if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
      stockQuery = stockQuery.order('date', { ascending: false }).limit(10);
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('performance')) {
      stockQuery = stockQuery.order('date', { ascending: false }).limit(60);
    } else {
      stockQuery = stockQuery.order('date', { ascending: false }).limit(20);
    }

    const { data, error } = await stockQuery;
    
    if (error) {
      console.error('Error querying stock data:', error);
      return [];
    }

    return data || [];
  };

  const determineQueryType = (query: string): 'stock' => {
    return 'stock';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const queryType = determineQueryType(input);
      let context = '';
      let sources: string[] = [];

      // Gather relevant context based on query type
      try {
        const stockData = await queryStockData(input);
        if (stockData.length > 0) {
          context += `\n\nStock Price Data:\n${stockData.map(row => 
            `Date: ${row.date}, Open: ${row.open}, High: ${row.high}, Low: ${row.low}, Close: ${row.close}`
          ).join('\n')}`;
          sources.push('Stock Price Database');
        }
      } catch (error) {
        console.error('Error querying stock data:', error);
      }



      if (!context.trim()) {
        context = "No specific data found for this query. Please provide a general response based on financial analysis principles.";
      }

      console.log('Generating response with context:', context.substring(0, 200) + '...');
      
      const response = await generateResponse(input, context);

      // Save query to database
      try {
        await supabase.from('user_queries').insert({
          query: input,
          answer: response,
          query_type: queryType,
          sources: sources.length > 0 ? sources : null
        });
      } catch (dbError) {
        console.error('Error saving query to database:', dbError);
        // Continue even if database save fails
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: sources.length > 0 ? [...new Set(sources)] : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      let errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'DeepSeek API key is not configured. Please set up your API key in the .env file.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What was the highest stock price in Jan-24?",
    "Compare Bajaj Finserv performance from Jan-24 to Mar-24",
    "What was the average stock price in Q1-24?",
    "Show me the lowest stock price last quarter",
    "What was the stock performance in December 2023?",
    "Calculate the percentage change from Jan to Mar 2024"
  ];

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Interface</h2>
        <div className="text-center py-8">
          <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No stock data available yet. Please upload CSV files first.</p>
          <p className="text-sm text-gray-500">Upload stock data to start asking questions about Bajaj Finserv's performance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-96">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Chat with AI Assistant</h2>
        <p className="text-sm text-gray-600">Ask questions about Bajaj Finserv's stock performance</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Bot className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-4">Start a conversation! Try asking:</p>
            <div className="space-y-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stock performance..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}