
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Download, Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VoterData } from '@/lib/types';
import { BulkUploadValidator, ValidationResult } from '@/components/voter/BulkUploadValidator';
import BulkUploadProgress from '@/components/voter/BulkUploadProgress';

const BulkVoterUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // File and data states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // UI states
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Template columns
  const templateColumns = [
    'Voter Name', 'Age', 'Gender', 'Phone', 'NID', 'Village Name',
    'Will Vote', 'Vote Probability (%)', 'Occupation', 'Education',
    'Political Support', 'Remarks'
  ];

  const downloadTemplate = useCallback(() => {
    const csvContent = Papa.unparse([templateColumns], { header: true });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'voter_upload_template.csv');
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const resetState = useCallback(() => {
    setCsvFile(null);
    setPreviewData([]);
    setPreviewVisible(false);
    setValidationResult(null);
    setCsvHeaders([]);
    setTotalRows(0);
    setUploadProgress(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    setUploadedCount(0);
    setUploadErrors([]);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCsvFile(file);
    setValidationResult(null);
    
    Papa.parse(file, {
      header: true,
      preview: 10,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
          
          if (headers.length === 0) {
            toast({
              title: 'Invalid CSV File',
              description: 'CSV file appears to be empty or has no headers',
              variant: 'destructive',
            });
            setIsProcessing(false);
            return;
          }

          // Check for required columns
          const hasVoterName = headers.some(header => 
            BulkUploadValidator.normalizeColumnName(header.toLowerCase()) === 'Voter Name'
          );

          if (!hasVoterName) {
            toast({
              title: 'Missing Required Column',
              description: 'CSV must contain a "Voter Name" column. Other columns are optional.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            return;
          }

          const data = results.data as any[];
          const filteredData = data.filter(row => {
            const voterNameKey = Object.keys(row).find(key => 
              BulkUploadValidator.normalizeColumnName(key.toLowerCase()) === 'Voter Name'
            );
            return voterNameKey && row[voterNameKey] && row[voterNameKey].toString().trim() !== '';
          });

          setTotalRows(filteredData.length);
          
          // Validate preview data
          const validation = BulkUploadValidator.validateData(filteredData.slice(0, 10));
          setValidationResult(validation);
          
          setPreviewData(filteredData.slice(0, 10));
          setPreviewVisible(true);

          toast({
            title: 'CSV File Processed',
            description: `Found ${filteredData.length} valid rows. ${validation.errors.length} errors and ${validation.warnings.length} warnings detected.`,
          });

        } catch (error) {
          console.error('CSV processing error:', error);
          toast({
            title: 'Processing Error',
            description: 'Failed to process CSV file. Please check the file format.',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        toast({
          title: 'CSV Parse Error',
          description: 'Failed to read CSV file. Please check file format.',
          variant: 'destructive',
        });
        setIsProcessing(false);
      },
    });
  }, [toast]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!csvFile) throw new Error('No CSV file selected');

      return new Promise<void>((resolve, reject) => {
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              setUploadProgress(0);
              setUploadedCount(0);
              setUploadErrors([]);

              const data = results.data as any[];
              const filteredData = data.filter(row => {
                const voterNameKey = Object.keys(row).find(key => 
                  BulkUploadValidator.normalizeColumnName(key.toLowerCase()) === 'Voter Name'
                );
                return voterNameKey && row[voterNameKey] && row[voterNameKey].toString().trim() !== '';
              });

              // Final validation
              const finalValidation = BulkUploadValidator.validateData(filteredData);
              if (!finalValidation.isValid) {
                throw new Error(`Validation failed: ${finalValidation.errors.length} errors found`);
              }

              // Process in batches
              const batchSize = 400; // Reduced for safety
              const batches = [];
              const errors: string[] = [];
              
              for (let i = 0; i < filteredData.length; i += batchSize) {
                batches.push(filteredData.slice(i, i + batchSize));
              }

              setTotalBatches(batches.length);

              // Process each batch
              for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                setCurrentBatch(batchIndex + 1);
                
                try {
                  const batch = writeBatch(db);
                  const batchData = batches[batchIndex];
                  
                  batchData.forEach((voter, index) => {
                    try {
                      const docRef = doc(collection(db, 'voters'));
                      const transformedData = BulkUploadValidator.transformRowData(voter);
                      
                      const voterData: VoterData = {
                        ...transformedData,
                        ID: docRef.id,
                        'Collection Date': new Date().toISOString(),
                        'Last Updated': new Date().toISOString(),
                        Collector: 'Bulk Upload System',
                      } as VoterData;

                      batch.set(docRef, voterData);
                    } catch (error) {
                      errors.push(`Row ${batchIndex * batchSize + index + 2}: ${error.message}`);
                    }
                  });
                  
                  await batch.commit();
                  setUploadedCount(prev => prev + batchData.length);
                  
                } catch (error) {
                  console.error(`Batch ${batchIndex + 1} failed:`, error);
                  errors.push(`Batch ${batchIndex + 1} failed: ${error.message}`);
                }
                
                // Update progress
                const progress = ((batchIndex + 1) / batches.length) * 100;
                setUploadProgress(progress);
                
                // Small delay to prevent overwhelming Firestore
                if (batchIndex < batches.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }

              setUploadErrors(errors);
              
              if (errors.length > 0) {
                console.warn('Upload completed with errors:', errors);
              }
              
              resolve();
            } catch (error) {
              console.error('Upload process failed:', error);
              reject(error);
            }
          },
          error: (error) => {
            console.error('CSV parsing failed:', error);
            reject(new Error('Failed to parse CSV file for upload'));
          },
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      const successCount = uploadedCount - uploadErrors.length;
      toast({
        title: 'Upload Completed!',
        description: `Successfully uploaded ${successCount} voters. ${uploadErrors.length > 0 ? `${uploadErrors.length} errors occurred.` : ''}`,
      });
    },
    onError: (error: any) => {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload voter data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleUpload = useCallback(() => {
    if (!csvFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (validationResult && validationResult.errors.length > 0) {
      toast({
        title: 'Validation Errors Found',
        description: `Please fix ${validationResult.errors.length} validation errors before uploading`,
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate();
  }, [csvFile, validationResult, uploadMutation, toast]);

  return (
    <DialogContent className="w-full max-w-[95vw] sm:max-w-6xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Production-Ready Bulk Voter Upload
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Production Guidelines:</strong> Only "Voter Name" is required. System validates data quality, 
            handles duplicates, and processes uploads in batches for optimal performance.
          </AlertDescription>
        </Alert>

        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="csvFile" className="text-sm font-medium">
              Select CSV File for Upload
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing || uploadMutation.isPending}
              className="w-full sm:w-auto"
            />
            {csvFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                disabled={uploadMutation.isPending}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Processing CSV file...</AlertDescription>
          </Alert>
        )}

        {/* File Summary */}
        {csvFile && !isProcessing && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">File: {csvFile.name}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Headers:</span>
                <span className="ml-2 font-medium">{csvHeaders.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Valid Rows:</span>
                <span className="ml-2 font-medium">{totalRows}</span>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <span className="ml-2 font-medium text-red-600">
                  {validationResult?.errors.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Warnings:</span>
                <span className="ml-2 font-medium text-yellow-600">
                  {validationResult?.warnings.length || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{validationResult.errors.length} Critical Error(s):</strong>
                  <ul className="mt-2 space-y-1 text-sm max-h-32 overflow-y-auto">
                    {validationResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        Row {error.row}: <strong>{error.field}</strong> - {error.message}
                      </li>
                    ))}
                    {validationResult.errors.length > 10 && (
                      <li>... and {validationResult.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong className="text-yellow-800">
                    {validationResult.warnings.length} Warning(s):
                  </strong>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-700 max-h-32 overflow-y-auto">
                    {validationResult.warnings.slice(0, 5).map((warning, index) => (
                      <li key={index}>
                        Row {warning.row}: <strong>{warning.field}</strong> - {warning.message}
                      </li>
                    ))}
                    {validationResult.warnings.length > 5 && (
                      <li>... and {validationResult.warnings.length - 5} more warnings</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Data Preview */}
        {previewVisible && previewData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Data Preview (First 10 Rows)</h3>
              <Badge variant="outline">
                Quality Score: {validationResult?.validRowCount || 0}/{validationResult?.totalRowCount || 0}
              </Badge>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvHeaders.map((header) => (
                      <TableHead key={header} className="text-xs sm:text-sm min-w-[100px]">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {csvHeaders.map((header) => (
                        <TableCell key={header} className="text-xs sm:text-sm">
                          {row[header]?.toString() || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* Upload Progress */}
        <BulkUploadProgress
          isUploading={uploadMutation.isPending}
          progress={uploadProgress}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          uploadedCount={uploadedCount}
          totalCount={totalRows}
          errors={uploadErrors}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            onClick={handleUpload}
            disabled={
              !csvFile || 
              uploadMutation.isPending || 
              isProcessing ||
              (validationResult && validationResult.errors.length > 0)
            }
            className="bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadMutation.isPending ? 'Uploading...' : `Upload ${totalRows} Voters`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default BulkVoterUpload;
