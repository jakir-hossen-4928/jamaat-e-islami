
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Download, Upload, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoterData } from '@/lib/types';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const BulkVoterUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  // All possible CSV columns (flexible - not all required)
  const possibleColumns = [
    'Voter Name', // This is the only required field
    'House Name',
    'FatherOrHusband',
    'Age',
    'Gender',
    'Marital Status',
    'Student',
    'Occupation',
    'Education',
    'Religion',
    'Phone',
    'WhatsApp',
    'NID',
    'Is Voter',
    'Will Vote',
    'Voted Before',
    'Vote Probability (%)',
    'Political Support',
    'Priority Level',
    'Has Disability',
    'Is Migrated',
    'Remarks'
  ];

  // Enhanced validation rules
  const validationRules: { [key: string]: (value: any, rowIndex: number) => ValidationError | null } = {
    'Voter Name': (value, rowIndex) => {
      if (!value || value.toString().trim() === '') {
        return { row: rowIndex + 2, field: 'Voter Name', message: 'Voter Name is required and cannot be empty' };
      }
      if (value.toString().length < 2) {
        return { row: rowIndex + 2, field: 'Voter Name', message: 'Voter Name must be at least 2 characters long' };
      }
      return null;
    },
    Age: (value, rowIndex) => {
      if (value && value !== '') {
        const age = parseInt(value.toString());
        if (isNaN(age) || age < 0 || age > 120) {
          return { row: rowIndex + 2, field: 'Age', message: 'Age must be a valid number between 0 and 120' };
        }
      }
      return null;
    },
    Gender: (value, rowIndex) => {
      if (value && !['Male', 'Female', 'Other', 'male', 'female', 'other'].includes(value.toString())) {
        return { row: rowIndex + 2, field: 'Gender', message: 'Gender must be Male, Female, or Other' };
      }
      return null;
    },
    'Marital Status': (value, rowIndex) => {
      if (value && !['Married', 'Unmarried', 'Widowed', 'Divorced', 'married', 'unmarried', 'widowed', 'divorced'].includes(value.toString())) {
        return { row: rowIndex + 2, field: 'Marital Status', message: 'Marital Status must be Married, Unmarried, Widowed, or Divorced' };
      }
      return null;
    },
    Phone: (value, rowIndex) => {
      if (value && value !== '') {
        const phone = value.toString().replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 15) {
          return { row: rowIndex + 2, field: 'Phone', message: 'Phone number must be between 10-15 digits' };
        }
      }
      return null;
    },
    'Vote Probability (%)': (value, rowIndex) => {
      if (value && value !== '') {
        const prob = parseInt(value.toString());
        if (isNaN(prob) || prob < 0 || prob > 100) {
          return { row: rowIndex + 2, field: 'Vote Probability (%)', message: 'Vote Probability must be a number between 0 and 100' };
        }
      }
      return null;
    },
    'Priority Level': (value, rowIndex) => {
      if (value && !['Low', 'Medium', 'High', 'low', 'medium', 'high'].includes(value.toString())) {
        return { row: rowIndex + 2, field: 'Priority Level', message: 'Priority Level must be Low, Medium, or High' };
      }
      return null;
    },
  };

  // Generate template with all possible columns
  const downloadTemplate = () => {
    const csvContent = Papa.unparse([possibleColumns], { header: true });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'voter_template.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  // Normalize column names (handle case variations)
  const normalizeColumnName = (columnName: string): string => {
    const normalized = columnName.trim();
    // Handle common variations
    const mappings: { [key: string]: string } = {
      'voter name': 'Voter Name',
      'name': 'Voter Name',
      'full name': 'Voter Name',
      'house name': 'House Name',
      'father or husband': 'FatherOrHusband',
      'father/husband': 'FatherOrHusband',
      'age': 'Age',
      'gender': 'Gender',
      'sex': 'Gender',
      'marital status': 'Marital Status',
      'student': 'Student',
      'occupation': 'Occupation',
      'job': 'Occupation',
      'education': 'Education',
      'religion': 'Religion',
      'phone': 'Phone',
      'mobile': 'Phone',
      'phone number': 'Phone',
      'whatsapp': 'WhatsApp',
      'nid': 'NID',
      'national id': 'NID',
      'is voter': 'Is Voter',
      'will vote': 'Will Vote',
      'voted before': 'Voted Before',
      'vote probability': 'Vote Probability (%)',
      'vote probability (%)': 'Vote Probability (%)',
      'political support': 'Political Support',
      'priority level': 'Priority Level',
      'priority': 'Priority Level',
      'has disability': 'Has Disability',
      'disability': 'Has Disability',
      'is migrated': 'Is Migrated',
      'migrated': 'Is Migrated',
      'remarks': 'Remarks',
      'comment': 'Remarks',
      'notes': 'Remarks'
    };
    
    return mappings[normalized.toLowerCase()] || normalized;
  };

  // Validate all data
  const validateData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      Object.keys(row).forEach((key) => {
        const normalizedKey = normalizeColumnName(key);
        const rule = validationRules[normalizedKey];
        if (rule) {
          const error = rule(row[key], index);
          if (error) {
            errors.push(error);
          }
        }
      });
    });
    
    return errors;
  };

  // Parse and preview CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setValidationErrors([]);
    
    Papa.parse(file, {
      header: true,
      preview: 10, // Show first 10 rows for preview
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        
        if (headers.length === 0) {
          toast({
            title: 'Invalid CSV',
            description: 'CSV file appears to be empty or has no headers',
            variant: 'destructive',
          });
          setPreviewData([]);
          setPreviewVisible(false);
          return;
        }

        // Check if at least 'Voter Name' exists (case insensitive)
        const hasVoterName = headers.some(header => 
          normalizeColumnName(header.toLowerCase()) === 'Voter Name'
        );

        if (!hasVoterName) {
          toast({
            title: 'Missing Required Column',
            description: 'CSV must contain a "Voter Name" column (case insensitive). Other columns are optional.',
            variant: 'destructive',
          });
          setPreviewData([]);
          setPreviewVisible(false);
          return;
        }

        const data = results.data as any[];
        const validData = data.filter((row) => {
          // Find voter name column (case insensitive)
          const voterNameKey = Object.keys(row).find(key => 
            normalizeColumnName(key.toLowerCase()) === 'Voter Name'
          );
          return voterNameKey && row[voterNameKey] && row[voterNameKey].toString().trim() !== '';
        });

        setTotalRows(validData.length);
        const errors = validateData(validData.slice(0, 10));
        setValidationErrors(errors);
        setPreviewData(validData.slice(0, 10));
        setPreviewVisible(true);

        toast({
          title: 'CSV Loaded Successfully',
          description: `Found ${validData.length} valid rows with voter names. ${errors.length} validation issues found in preview.`,
        });
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        toast({
          title: 'CSV Parse Error',
          description: 'Failed to read CSV file. Please check file format.',
          variant: 'destructive',
        });
        setPreviewData([]);
        setPreviewVisible(false);
      },
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!csvFile) throw new Error('No CSV file selected');

      return new Promise<void>((resolve, reject) => {
        Papa.parse(csvFile, {
          header: true,
          complete: async (results) => {
            try {
              console.log('Starting full CSV processing...');
              
              const headers = results.meta.fields || [];
              const data = results.data as any[];
              
              // Filter valid data
              const validData = data.filter((row) => {
                const voterNameKey = Object.keys(row).find(key => 
                  normalizeColumnName(key.toLowerCase()) === 'Voter Name'
                );
                return voterNameKey && row[voterNameKey] && row[voterNameKey].toString().trim() !== '';
              });

              console.log(`Processing ${validData.length} valid rows...`);

              // Validate all data
              const allErrors = validateData(validData);
              
              if (allErrors.length > 0) {
                console.log('Validation errors found:', allErrors);
                reject(new Error(`Found ${allErrors.length} validation errors. Please fix data and try again.`));
                return;
              }

              // Process data in batches (Firestore limit is 500 operations per batch)
              const batchSize = 450;
              const batches = [];
              
              for (let i = 0; i < validData.length; i += batchSize) {
                const batch = writeBatch(db);
                const batchData = validData.slice(i, i + batchSize);
                
                batchData.forEach((voter) => {
                  const docRef = doc(collection(db, 'voters'));
                  
                  // Normalize and map the data
                  const normalizedData: any = {};
                  Object.keys(voter).forEach(key => {
                    const normalizedKey = normalizeColumnName(key);
                    let value = voter[key];
                    
                    // Clean and format values
                    if (value !== null && value !== undefined && value !== '') {
                      // Convert string values to proper case where needed
                      if (['Gender', 'Marital Status', 'Priority Level'].includes(normalizedKey)) {
                        value = value.toString().charAt(0).toUpperCase() + value.toString().slice(1).toLowerCase();
                      }
                      
                      // Convert Yes/No values
                      if (['Student', 'WhatsApp', 'Is Voter', 'Will Vote', 'Voted Before', 'Has Disability', 'Is Migrated'].includes(normalizedKey)) {
                        value = ['yes', 'true', '1'].includes(value.toString().toLowerCase()) ? 'Yes' : 
                               ['no', 'false', '0'].includes(value.toString().toLowerCase()) ? 'No' : value;
                      }
                      
                      // Convert numbers
                      if (['Age', 'Vote Probability (%)'].includes(normalizedKey)) {
                        const num = parseInt(value.toString());
                        value = isNaN(num) ? undefined : num;
                      }
                      
                      if (value !== undefined) {
                        normalizedData[normalizedKey] = value;
                      }
                    }
                  });

                  // Add required fields
                  const voterData: VoterData = {
                    ...normalizedData,
                    ID: docRef.id, // Use Firestore document ID
                    'Collection Date': new Date().toISOString(),
                    'Last Updated': new Date().toISOString(),
                    Collector: 'Bulk Upload',
                  };

                  console.log('Adding voter data:', voterData);
                  batch.set(docRef, voterData);
                });
                
                batches.push(batch);
              }

              // Execute all batches
              console.log(`Executing ${batches.length} batches...`);
              await Promise.all(batches.map(batch => batch.commit()));
              
              console.log('Upload completed successfully');
              resolve();
            } catch (error) {
              console.error('Upload error:', error);
              reject(error);
            }
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            reject(new Error('Failed to parse CSV file'));
          },
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: 'Upload Successful!',
        description: `Successfully uploaded ${totalRows} voters to the database.`,
      });
      setCsvFile(null);
      setPreviewData([]);
      setPreviewVisible(false);
      setValidationErrors([]);
      setCsvHeaders([]);
      setTotalRows(0);
    },
    onError: (error: any) => {
      console.error('Upload mutation error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload voter data. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleUpload = () => {
    if (!csvFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Errors Found',
        description: `Please fix ${validationErrors.length} validation errors before uploading`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate();
  };

  return (
    <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl lg:max-w-6xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Voter Upload
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instructions:</strong> Only "Voter Name" column is required. All other columns are optional. 
            The system will automatically handle missing columns and create Firestore IDs for each record.
          </AlertDescription>
        </Alert>

        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="csvFile" className="text-sm font-medium">Select CSV File</Label>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full sm:w-auto"
            />
            {csvFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCsvFile(null);
                  setPreviewData([]);
                  setPreviewVisible(false);
                  setValidationErrors([]);
                  setCsvHeaders([]);
                  setTotalRows(0);
                }}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Download Template */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Download template with all possible columns
          </p>
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

        {/* File Info */}
        {csvFile && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">File Loaded: {csvFile.name}</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Headers found: {csvHeaders.length}</p>
              <p>Valid rows: {totalRows}</p>
              <p>Validation errors: {validationErrors.length}</p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{validationErrors.length} Validation Error(s) Found:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>
                    Row {error.row}: {error.field} - {error.message}
                  </li>
                ))}
                {validationErrors.length > 5 && (
                  <li>... and {validationErrors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Preview */}
        {previewVisible && previewData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Data Preview (First 10 Rows)</h3>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            onClick={handleUpload}
            disabled={!csvFile || isUploading || validationErrors.length > 0}
            className="bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : `Upload ${totalRows} Voters`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default BulkVoterUpload;
