import React, { useState } from 'react';
import { Upload, BarChart3, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  processTextFile,
  parseCSVData,
  type StockData 
} from '../lib/fileProcessing';

interface FileUploadProps {
  onUploadComplete: () => void;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [stockStatus, setStockStatus] = useState<UploadStatus>({ status: 'idle', message: '' });

  const handleStockUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStockStatus({ status: 'uploading', message: 'Processing CSV...', progress: 0 });

    try {
      const csvText = await processTextFile(file);
      setStockStatus({ status: 'uploading', message: 'Parsing data...', progress: 25 });

      const stockData = parseCSVData(csvText);
      setStockStatus({ status: 'uploading', message: 'Uploading to database...', progress: 50 });

      // Insert stock data
      const { error } = await supabase
        .from('stock_prices')
        .upsert(stockData, { onConflict: 'date' });

      if (error) throw error;

      setStockStatus({ status: 'success', message: `Successfully uploaded ${stockData.length} records` });
      onUploadComplete();
    } catch (error) {
      console.error('Stock upload error:', error);
      setStockStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Upload failed' 
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const StatusIndicator = ({ status }: { status: UploadStatus }) => {
    switch (status.status) {
      case 'uploading':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600">{status.message}</span>
            {status.progress && (
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            )}
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">{status.message}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">{status.message}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center">
      {/* Stock Data Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors w-full max-w-md">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Stock Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload CSV with columns: Date, Close Price
          </p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleStockUpload}
              className="hidden"
              disabled={stockStatus.status === 'uploading'}
            />
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
              <Upload className="w-4 h-4 mr-2" />
              Choose CSV
            </div>
          </label>
          
          <div className="mt-4">
            <StatusIndicator status={stockStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}