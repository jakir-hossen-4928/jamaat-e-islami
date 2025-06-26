import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import html2pdf from 'html2pdf.js';

const DataHub = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'Voter Name',
    'Phone',
    'Age',
    'Gender'
  ]);
  const { toast } = useToast();

  const { data: voters = [], isLoading } = useQuery({
    queryKey: ['voters'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    }
  });

  const availableFields = [
    'ID', 'Voter Name', 'House Name', 'FatherOrHusband', 'Age', 'Gender',
    'Marital Status', 'Student', 'Occupation', 'Education', 'Religion',
    'Phone', 'WhatsApp', 'NID', 'Is Voter', 'Will Vote', 'Voted Before',
    'Vote Probability (%)', 'Political Support', 'Priority Level',
    'Has Disability', 'Is Migrated', 'Remarks', 'Collector',
    'Collection Date', 'Last Updated'
  ];

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const exportToCSV = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত একটি ফিল্ড নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const exportData = voters.map(voter => {
      const row: any = {};
      selectedFields.forEach(field => {
        row[field] = voter[field as keyof VoterData] || '';
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voters_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "সফল",
      description: "CSV ফাইল ডাউনলোড হয়েছে",
    });
  };

  const exportToPDF = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত একটি ফিল্ড নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const exportDate = new Date().toLocaleDateString();
    
    const htmlContent = `
      <html>
        <head>
          <title>ভোটার তালিকা</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2c3e50; margin: 0; }
            .header p { color: #555; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #059669; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>জামায়াত-ই-ইসলামী বাংলাদেশ</h1>
            <h2>ভোটার তালিকা</h2>
            <p>তারিখ: ${exportDate}</p>
            <p>মোট ভোটার: ${voters.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${selectedFields.map(field => `<th>${field}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${voters.map(voter => `
                <tr>
                  ${selectedFields.map(field => `<td>${voter[field as keyof VoterData] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            জামায়াত-ই-ইসলামী বাংলাদেশ • ${exportDate}
          </div>
        </body>
      </html>
    `;

    const opt = {
      margin: 1,
      filename: `voters_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(htmlContent).save();

    toast({
      title: "সফল",
      description: "PDF ফাইল ডাউনলোড হয়েছে",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ডেটা হাব</h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-600">মোট ভোটার: {voters.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Field Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ফিল্ড নির্বাচন করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFields.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <label className="text-sm">{field}</label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFields(availableFields)}
                  >
                    সব নির্বাচন
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFields([])}
                  >
                    সব বাতিল
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>এক্সপোর্ট অপশন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  নির্বাচিত ফিল্ড: {selectedFields.length}
                </p>
              </div>

              <Button
                onClick={exportToCSV}
                className="w-full"
                disabled={isLoading || selectedFields.length === 0}
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV এ ডাউনলোড
              </Button>

              <Button
                onClick={exportToPDF}
                className="w-full"
                disabled={isLoading || selectedFields.length === 0}
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF এ ডাউনলোড
              </Button>

              <div className="text-xs text-gray-500 mt-4">
                <p>• CSV ফাইল এক্সেল বা অন্য স্প্রেডশিট সফটওয়্যারে খোলা যাবে</p>
                <p>• PDF ফাইল প্রিন্ট বা শেয়ার করার জন্য উপযুক্ত</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {selectedFields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ডেটা প্রিভিউ (প্রথম ১০ রেকর্ড)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {selectedFields.map(field => (
                        <th key={field} className="border border-gray-300 p-2 text-left">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {voters.slice(0, 10).map((voter, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {selectedFields.map(field => (
                          <td key={field} className="border border-gray-300 p-2">
                            {voter[field as keyof VoterData] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {voters.length > 10 && (
                <p className="text-center text-gray-600 mt-4">
                  আরও {voters.length - 10} টি রেকর্ড রয়েছে...
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default DataHub;
