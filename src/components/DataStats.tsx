import React, { useState, useEffect } from 'react';
import { Database, FileText, BarChart3, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  transcriptChunks: number;
  stockRecords: number;
  totalQueries: number;
  lastUpdated: string | null;
}

interface DataStatsProps {
  refreshTrigger: number;
}

export function DataStats({ refreshTrigger }: DataStatsProps) {
  const [stats, setStats] = useState<Stats>({
    transcriptChunks: 0,
    stockRecords: 0,
    totalQueries: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [transcriptResult, stockResult, queriesResult] = await Promise.all([
        supabase.from('transcript_chunks').select('id', { count: 'exact' }),
        supabase.from('stock_prices').select('date', { count: 'exact' }),
        supabase.from('user_queries').select('created_at', { count: 'exact' })
      ]);

      // Get latest update time
      const latestTranscript = await supabase
        .from('transcript_chunks')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const latestStock = await supabase
        .from('stock_prices')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastUpdated = [
        latestTranscript.data?.[0]?.created_at,
        latestStock.data?.[0]?.created_at
      ]
        .filter(Boolean)
        .sort()
        .reverse()[0] || null;

      setStats({
        transcriptChunks: transcriptResult.count || 0,
        stockRecords: stockResult.count || 0,
        totalQueries: queriesResult.count || 0,
        lastUpdated
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statCards = [
    {
      title: 'Transcript Chunks',
      value: stats.transcriptChunks,
      icon: FileText,
      color: 'blue',
      loading
    },
    {
      title: 'Stock Records',
      value: stats.stockRecords,
      icon: BarChart3,
      color: 'green',
      loading
    },
    {
      title: 'Total Queries',
      value: stats.totalQueries,
      icon: MessageSquare,
      color: 'purple',
      loading
    },
    {
      title: 'Last Updated',
      value: formatDate(stats.lastUpdated),
      icon: Database,
      color: 'gray',
      loading
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = {
          blue: 'bg-blue-50 text-blue-600',
          green: 'bg-green-50 text-green-600',
          purple: 'bg-purple-50 text-purple-600',
          gray: 'bg-gray-50 text-gray-600'
        };

        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.loading ? '...' : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses[card.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}