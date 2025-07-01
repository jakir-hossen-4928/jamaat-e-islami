import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface BulkUploadProgressProps {
  isUploading: boolean;
  progress: number;
  currentBatch: number;
  totalBatches: number;
  uploadedCount: number;
  totalCount: number;
  errors: string[];
}

const BulkUploadProgress: React.FC<BulkUploadProgressProps> = ({
  isUploading,
  progress,
  currentBatch,
  totalBatches,
  uploadedCount,
  totalCount,
  errors
}) => {
  if (!isUploading && uploadedCount === 0) return null;

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isUploading ? (
                <Upload className="w-5 h-5 animate-pulse text-blue-600" />
              ) : errors.length > 0 ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <span className="font-medium">
                {isUploading ? 'Uploading...' : errors.length > 0 ? 'Upload Completed with Errors' : 'Upload Completed'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {uploadedCount}/{totalCount} records
            </span>
          </div>

          <Progress value={progress} className="w-full" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Batch Progress:</span>
              <span className="ml-2 font-medium">{currentBatch}/{totalBatches}</span>
            </div>
            <div>
              <span className="text-gray-600">Success Rate:</span>
              <span className="ml-2 font-medium">
                {totalCount > 0 ? Math.round(((uploadedCount - errors.length) / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-2">
                {errors.length} Error(s) Occurred:
              </p>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {errors.length > 5 && (
                  <li>• ... and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(BulkUploadProgress);
