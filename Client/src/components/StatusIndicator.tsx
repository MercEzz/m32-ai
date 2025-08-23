import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Loader2, Search, PenTool, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const StatusIndicator: React.FC = () => {
  const { statusUpdate, isConnected } = useWebSocket();

  if (!statusUpdate || !isConnected) return null;

  const getStatusIcon = () => {
    switch (statusUpdate.stage) {
      case 'thinking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'researching':
        return <Search className="h-4 w-4 animate-pulse text-purple-500" />;
      case 'writing':
        return <PenTool className="h-4 w-4 animate-pulse text-green-500" />;
      case 'reviewing':
        return <Eye className="h-4 w-4 animate-pulse text-orange-500" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (statusUpdate.type) {
      case 'status':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'progress':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'result':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-3 rounded-lg border shadow-lg transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{statusUpdate.message}</span>
      </div>
      
      {statusUpdate.progress !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-current h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${statusUpdate.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
