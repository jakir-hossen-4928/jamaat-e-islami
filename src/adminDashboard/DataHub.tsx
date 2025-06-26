
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Filter } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import html2pdf from 'html2pdf.js';

const DataHub = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'Voter Name', 'Phone', 'Age', 'Gender', 'Will Vote', 'Priority Level'
  ]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
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
    { key: 'ID', label: 'ID' },
    { key: 'Voter Name', label: 'ভোটারের নাম' },
    { key: 'House Name', label: 'বাড়ির নাম' },
    { key: 'FatherOrHusband', label: 'পিতা/স্বামী' },
    { key: 'Age', label: 'বয়স' },
    { key: 'Gender', label: 'লিঙ্গ' },
    { key: 'Marital Status', label: 'বৈবাহিক অবস্থা' },
    { key: 'Student', label: 'ছাত্র/ছাত্রী' },
    { key: 'Occupation', label: 'পেশা' },
    { key: 'Education', label: 'শিক্ষা' },
    { key: 'Religion', label: 'ধর্ম' },
    { key: 'Phone', label: 'ফোন' },
    { key: 'WhatsApp', label: 'হোয়াটসঅ্যাপ' },
    { key: 'NID', label: 'NID' },
    { key: 'Is Voter', label: 'ভোটার কিনা' },
    { key: 'Will Vote', label: 'ভোট দেবেন' },
    { key: 'Voted Before', label: 'আগে ভোট দিয়েছেন' },
    { key: 'Vote Probability (%)', label: 'ভোট সম্ভাবনা (%)' },
    { key: 'Political Support', label: 'রাজনৈতিক সমর্থন' },
    { key: 'Priority Level', label: 'অগ্রাধিকার স্তর' },
    { key: 'Has Disability', label: 'প্রতিবন্ধী' },
    { key: 'Is Migrated', label: 'অভিবাসী' },
    { key: 'Remarks', label: 'মন্তব্য' },
    { key: 'Collector', label: 'সংগ্রহকারী' },
    { key: 'Collection Date', label: 'সংগ্রহের তারিখ' },
    { key: 'Last Updated', label: 'সর্বশেষ আপডেট' }
  ];

  const handleFieldToggle = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter(f => f !== field));
    }
  };

  const exportToCSV = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত একটি ক্ষেত্র নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const exportData = voters.map(voter => {
      const filteredVoter: any = {};
      selectedFields.forEach(field => {
        filteredVoter[field] = voter[field as keyof VoterData] || '';
      });
      return filteredVoter;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voters_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "সফল",
      description: "CSV ফাইল ডাউনলোড হয়েছে",
    });

    setExportDialogOpen(false);
  };

  const generatePDFReport = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত একটি ক্ষেত্র নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ভোটার রিপোর্ট</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 15px; }
          .header h1 { color: #059669; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          .stats { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
          th { background-color: #059669; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>জামায়াতে ইসলামী - ভোটার রিপোর্ট</h1>
          <p>তৈরি: ${new Date().toLocaleString('bn-BD')}</p>
        </div>
        
        <div class="stats">
          <strong>মোট ভোটার:</strong> ${voters.length} জন<br>
          <strong>নির্বাচিত ক্ষেত্র:</strong> ${selectedFields.length} টি<br>
          <strong>রিপোর্ট তৈরির তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}
        </div>

        <table>
          <thead>
            <tr>
              ${selectedFields.map(field => {
                const fieldLabel = availableFields.find(f => f.key === field)?.label || field;
                return `<th>${fieldLabel}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${voters.slice(0, 100).map(voter => `
              <tr>
                ${selectedFields.map(field => `<td>${voter[field as keyof VoterData] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${voters.length > 100 ? `<p style="text-align: center; margin-top: 20px; color: #666;">প্রথম ১০০ টি রেকর্ড প্রদর্শিত হয়েছে। সম্পূর্ণ তালিকার জন্য CSV এক্সপোর্ট ব্যবহার করুন।</p>` : ''}
        
        <div class="footer">
          <p>জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা সিস্টেম</p>
          <p>ডেভেলপার: জাকির হোসেন | যোগাযোগ: ০১৬৪৭৪৭০৮৪৯</p>
        </div>
      </body>
      </html>
    `;

    const opt = {
      margin: 0.5,
      filename: `voter_report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(reportHtml).save();

    toast({
      title: "সফল",
      description: "PDF রিপোর্ট ডাউনলোড হয়েছে",
    });

    setReportDialogOpen(false);
  };

  const quickExports = [
    {
      name: 'ফোন নম্বর তালিকা',
      fields: ['Voter Name', 'Phone'],
      description: 'শুধুমাত্র নাম ও ফোন নম্বর'
    },
    {
      name: 'উচ্চ অগ্রাধিকার ভোটার',
      fields: ['Voter Name', 'Phone', 'Age', 'Priority Level', 'Vote Probability (%)'],
      description: 'উচ্চ অগ্রাধিকার ভোটারদের তথ্য'
    },
    {
      name: 'সম্পূর্ণ তথ্য',
      fields: availableFields.map(f => f.key),
      description: 'সকল ক্ষেত্র সহ সম্পূর্ণ তথ্য'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ডেটা হাব</h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-600">মোট ভোটার: {voters.length}</span>
          </div>
        </div>

        {/* Quick Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickExports.map((option, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{option.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedFields(option.fields);
                      exportToCSV();
                    }}
                    className="flex-1"
                  >
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFields(option.fields);
                      generatePDFReport();
                    }}
                    className="flex-1"
                  >
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>কাস্টম এক্সপোর্ট</span>
              <div className="flex space-x-2">
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      CSV এক্সপোর্ট
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>CSV এক্সপোর্ট - ক্ষেত্র নির্বাচন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {availableFields.map(field => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedFields.includes(field.key)}
                              onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                            />
                            <label className="text-sm">{field.label}</label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-gray-600">
                          নির্বাচিত: {selectedFields.length} টি ক্ষেত্র
                        </span>
                        <Button onClick={exportToCSV}>
                          CSV ডাউনলোড করুন
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF রিপোর্ট
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>PDF রিপোর্ট - ক্ষেত্র নির্বাচন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">
                          <strong>নোট:</strong> PDF রিপোর্টে প্রথম ১০০ টি রেকর্ড প্রদর্শিত হবে। সম্পূর্ণ তালিকার জন্য CSV এক্সপোর্ট ব্যবহার করুন।
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {availableFields.map(field => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedFields.includes(field.key)}
                              onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                            />
                            <label className="text-sm">{field.label}</label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-gray-600">
                          নির্বাচিত: {selectedFields.length} টি ক্ষেত্র
                        </span>
                        <Button onClick={generatePDFReport}>
                          PDF ডাউনলোড করুন
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              আপনার প্রয়োজন অনুযায়ী ক্ষেত্র নির্বাচন করে ডেটা এক্সপোর্ট করুন। CSV ফরম্যাট সম্পূর্ণ ডেটার জন্য এবং PDF রিপোর্ট প্রিন্ট করার জন্য উপযুক্ত।
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">CSV এক্সপোর্ট</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• সম্পূর্ণ ডেটা</li>
                  <li>• Excel এ খোলা যায়</li>
                  <li>• ডেটা বিশ্লেষণের জন্য উপযুক্ত</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">PDF রিপোর্ট</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• সুন্দর ফরম্যাট</li>
                  <li>• প্রিন্ট করার জন্য উপযুক্ত</li>
                  <li>• প্রথম ১০০ রেকর্ড</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">নিরাপত্তা</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• শুধুমাত্র অ্যাডমিন অ্যাক্সেস</li>
                  <li>• ডেটা এনক্রিপ্টেড</li>
                  <li>• অডিট লগ রক্ষিত</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DataHub;
