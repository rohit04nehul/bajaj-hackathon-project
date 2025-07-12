import  { useState, useEffect } from 'react';
import { TrendingUp, Database, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { DataStats } from './components/DataStats';
import { testSupabaseConnection } from './lib/supabase';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
    loading: boolean;
  }>({ connected: false, loading: true });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus({ connected: false, loading: true });
    const result = await testSupabaseConnection();
    setConnectionStatus({ 
      connected: result.connected, 
      error: result.error, 
      loading: false 
    });
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bajaj Finserv AI Assistant</h1>
                <p className="text-sm text-gray-600">Financial insights powered by AI and vector search</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Database className="w-4 h-4" />
                <span>Supabase</span>
                {!connectionStatus.loading && (
                  connectionStatus.connected ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )
                )}
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>Together AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Connection Status Alert */}
      {!connectionStatus.loading && !connectionStatus.connected && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Supabase Connection Failed:</strong> {connectionStatus.error}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Please check your environment variables and database setup.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Statistics */}
        <div className="mb-6">
          <DataStats refreshTrigger={refreshTrigger} />
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Stock Data</h2>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Chat Interface */}
        <div className="mb-8">
          <ChatInterface refreshTrigger={refreshTrigger} />
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="flex justify-center">
            <div className="max-w-md">
              <h3 className="font-medium text-gray-700 mb-2">📊 Upload Stock Data</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload CSV with columns: Date, Close Price</li>
                <li>• Date format: DD-MMM-YY (e.g., 3-Jan-22)</li>
                <li>• Historical stock price data analysis</li>
                <li>• Supports date range queries</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">💬 Example Questions</h3>
            <div className="flex justify-center">
              <div className="max-w-md">
                <p className="font-medium text-gray-700 mb-1">Stock Analysis:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "What was the highest stock price in Jan-24?"</li>
                  <li>• "Compare Bajaj Finserv from Jan-24 to Mar-24"</li>
                  <li>• "What was the average stock price in Q1-24?"</li>
                  <li>• "Show me the lowest stock price last quarter"</li>
                  <li>• "What was the stock performance in December 2023?"</li>
                  <li>• "Calculate the percentage change from Jan to Mar 2024"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by Supabase, Together AI, and pgvector for intelligent financial analysis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;