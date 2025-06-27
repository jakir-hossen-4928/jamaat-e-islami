import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Added missing imports
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Download, Upload, X, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VoterData } from './AddVoters'; // Import VoterData interface

const BulkVoterUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<VoterData>[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Expected CSV columns
  const expectedColumns = [
    'Voter Name',
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

  // Validation rules
  const validationRules: { [key in keyof VoterData]?: (value: any) => string | null } = {
    'Voter Name': (value) => (!value || value.trim() === '' ? 'Voter Name is required' : null),
    Age: (value) => {
      if (value && (isNaN(value) || value < 0 || value > 120)) {
        return 'Age must be a number between 0 and 120';
      }
      return null;
    },
    Gender: (value) => (value && !['Male', 'Female', 'Other'].includes(value) ? 'Gender must be Male, Female, or Other' : null),
    'Marital Status': (value) =>
      value && !['Married', 'Unmarried', 'Widowed', 'Divorced'].includes(value)
        ? 'Marital Status must be Married, Unmarried, Widowed, or Divorced'
        : null,
    Student: (value) => (value && !['Yes', 'No'].includes(value) ? 'Student must be Yes or No' : null),
    WhatsApp: (value) => (value && !['Yes', 'No'].includes(value) ? 'WhatsApp must be Yes or No' : null),
    'Is Voter': (value) => (value && !['Yes', 'No'].includes(value) ? 'Is Voter must be Yes or No' : null),
    'Will Vote': (value) => (value && !['Yes', 'No'].includes(value) ? 'Will Vote must be Yes or No' : null),
    'Voted Before': (value) => (value && !['Yes', 'No'].includes(value) ? 'Voted Before must be Yes or No' : null),
    'Vote Probability (%)': (value) => {
      if (value && (isNaN(value) || value < 0 || value > 100)) {
        return 'Vote Probability must be a number between 0 and 100';
      }
      return null;
    },
    'Priority Level': (value) =>
      value && !['Low', 'Medium', 'High'].includes(value) ? 'Priority Level must be Low, Medium, or High' : null,
    'Has Disability': (value) => (value && !['Yes', 'No'].includes(value) ? 'Has Disability must be Yes or No' : null),
    'Is Migrated': (value) => (value && !['Yes', 'No'].includes(value) ? 'Is Migrated must be Yes or No' : null),
  };

  // Generate Google Sheets template
  const downloadTemplate = () => {
    const csvContent = Papa.unparse([expectedColumns], { header: true });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'voter_template.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  // Validate CSV headers
  const validateHeaders = (headers: string[]) => {
    const missingColumns = expectedColumns.filter((col) => !headers.includes(col));
    if (missingColumns.length > 0 && headers.length === 0) {
      return 'CSV file is empty or invalid';
    }
    return null;
  };

  // Validate row data
  const validateRow = (row: Partial<VoterData>): string[] => {
    const errors: string[] = [];
    Object.keys(row).forEach((key) => {
      const rule = validationRules[key as keyof VoterData];
      if (rule) {
        const error = rule(row[key as keyof VoterData]);
        if (error) {
          errors.push(`${key}: ${error}`);
        }
      }
    });
    return errors;
  };

  // Parse and preview CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      preview: 5, // Show first 5 rows for preview
      complete: (results) => {
        const headers = results.meta.fields || [];
        const headerError = validateHeaders(headers);
        if (headerError) {
          toast({
            title: 'Invalid CSV',
            description: headerError,
            variant: 'destructive',
          });
          setPreviewData([]);
          setPreviewVisible(false);
          return;
        }

        const data = results.data as Partial<VoterData>[];
        const validData = data.filter((row) => row['Voter Name'] && row['Voter Name'].trim() !== '');
        const validatedData = validData.map((row) => ({
          ...row,
          errors: validateRow(row),
        }));

        setPreviewData(validatedData.slice(0, 5));
        setPreviewVisible(true);
      },
      error: () => {
        toast({
          title: 'Error',
          description: 'Failed to read CSV file',
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
            const headers = results.meta.fields || [];
            const headerError = validateHeaders(headers);
            if (headerError) {
              reject(new Error(headerError));
              return;
            }

            const validData = (results.data as Partial<VoterData>[]).filter(
              (row) => row['Voter Name'] && row['Voter Name'].trim() !== ''
            );

            const validationErrors: string[] = [];
            validData.forEach((row, index) => {
              const errors = validateRow(row);
              if (errors.length > 0) {
                validationErrors.push(`Row ${index + 2}: ${errors.join(', ')}`);
              }
            });

            if (validationErrors.length > 0) {
              reject(new Error(`Validation errors: ${validationErrors.join('; ')}`));
              return;
            }

            const batch = writeBatch(db);
            const votersRef = collection(db, 'voters');

            validData.forEach((voter, index) => {
              const docRef = doc(votersRef);
              const voterData: VoterData = {
                ...voter,
                ID: (Date.now() + index).toString(),
                'Collection Date': new Date().toISOString(),
                'Last Updated': new Date().toISOString(),
                Collector: 'Admin',
                Age: voter.Age ? parseInt(voter.Age.toString()) : undefined,
                'Vote Probability (%)': voter['Vote Probability (%)']
                  ? parseInt(voter['Vote Probability (%)'].toString())
                  : undefined,
              };

              Object.keys(voterData).forEach((key) => {
                if (voterData[key as keyof VoterData] === '' || voterData[key as keyof VoterData] === undefined) {
                  delete voterData[key as keyof VoterData];
                }
              });

              batch.set(docRef, voterData);
            });

            await batch.commit();
            resolve();
          },
          error: (error) => reject(error),
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: 'Success',
        description: 'Voters uploaded successfully',
      });
      setCsvFile(null);
      setPreviewData([]);
      setPreviewVisible(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to process CSV file',
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
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }
    setIsUploading(true);
    uploadMutation.mutate();
  };

  return (
    <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl">Bulk Voter Upload</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 sm:space-y-6">
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
            Download a template to ensure correct formatting
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

        {/* Expected Columns */}
        <div className="text-sm text-gray-600">
          <p>CSV must include these headers (required: Voter Name):</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
            {expectedColumns.join(', ')}
          </p>
        </div>

        {/* Data Preview */}
        {previewVisible && previewData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Data Preview (First 5 Rows)</h3>
            <ScrollArea className="h-[200px] sm:h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {expectedColumns.map((col) => (
                      <TableHead key={col} className="text-xs sm:text-sm">{col}</TableHead>
                    ))}
                    <TableHead className="text-xs sm:text-sm">Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {expectedColumns.map((col) => (
                        <TableCell key={col} className="text-xs sm:text-sm">
                          {row[col as keyof VoterData]?.toString() || '-'}
                        </TableCell>
                      ))}
                      <TableCell className="text-xs sm:text-sm text-red-500">
                        {row.errors?.length ? row.errors.join(', ') : '-'}
                      </TableCell>
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
            disabled={!csvFile || isUploading || previewData.some((row) => row.errors?.length)}
            className="bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Voters'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default BulkVoterUpload;
