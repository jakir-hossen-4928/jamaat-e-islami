
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/lib/usePageTitle';
import Papa from 'papaparse';
import html2pdf from 'html2pdf.js';

const DataHub = () => {
  usePageTitle('ডেটা হাব - এক্সপোর্ট সেন্টার');
  
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
    link.setAttribute('download', `জামায়াত-ভোটার-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ সফল",
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

    const exportDate = new Date().toLocaleDateString('bn-BD');
    
    const htmlContent = `
      <html>
        <head>
          <title>ভোটার তালিকা</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 15px; 
              font-size: 11px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 25px; 
              background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
            }
            .header h1 { 
              color: white; 
              margin: 0 0 5px 0; 
              font-size: 18px;
            }
            .header h2 { 
              margin: 5px 0; 
              font-size: 14px;
              font-weight: normal;
            }
            .header p { 
              color: rgba(255,255,255,0.9); 
              margin: 3px 0; 
              font-size: 11px;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin: 15px 0;
              background: rgba(255,255,255,0.1);
              padding: 10px;
              border-radius: 6px;
            }
            .stat-item {
              text-align: center;
              font-size: 10px;
            }
            .stat-number {
              font-size: 16px;
              font-weight: bold;
              display: block;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 9px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background: linear-gradient(135deg, #16a34a 0%, #059669 100%); 
              color: white; 
              font-weight: bold;
              font-size: 9px;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            tr:hover {
              background-color: #f3f4f6;
            }
            .footer { 
              margin-top: 20px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 10px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 6px;
              border-top: 2px solid #16a34a;
            }
            .developer-info {
              background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
              color: white;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
              font-size: 10px;
            }
            .developer-info h4 {
              margin: 0 0 8px 0;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>জামায়াতে ইসলামী বাংলাদেশ</h1>
            <h2>কাকৈর খোলা, চৌদ্দগ্রাম শাখা</h2>
            <h2>ভোটার তালিকা</h2>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-number">${voters.length}</span>
                মোট ভোটার
              </div>
              <div class="stat-item">
                <span class="stat-number">${voters.filter(v => v['Will Vote'] === 'Yes').length}</span>
                ভোট দেবেন
              </div>
              <div class="stat-item">
                <span class="stat-number">${exportDate}</span>
                তৈরির তারিখ
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">ক্রম</th>
                ${selectedFields.map(field => `<th>${field}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${voters.map((voter, index) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                  ${selectedFields.map(field => `<td>${voter[field as keyof VoterData] || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="developer-info">
            <h4>🔧 সিস্টেম ডেভেলপার</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div><strong>নাম:</strong> মোঃ জাকির খান</div>
              <div><strong>ইমেইল:</strong> mdjakirkhan4928@gmail.com</div>
              <div><strong>WhatsApp:</strong> 01647470849</div>
              <div><strong>পদবি:</strong> ফুল স্ট্যাক ডেভেলপার</div>
            </div>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 8px;">
              <strong style="color: #16a34a;">জামায়াতে ইসলামী বাংলাদেশ - কাকৈর খোলা, চৌদ্দগ্রাম শাখা</strong>
            </div>
            <div>📧 mdjakirkhan4928@gmail.com | 📱 01647470849</div>
            <div style="margin-top: 8px; font-size: 9px;">
              © ${new Date().getFullYear()} জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।
            </div>
          </div>
        </body>
      </html>
    `;

    const opt = {
      margin: 0.5,
      filename: `জামায়াত-ভোটার-তালিকা-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(htmlContent).save();

    toast({
      title: "✅ সফল",
      description: "PDF ফাইল ডাউনলোড হয়েছে",
    });
  };

  // Calculate statistics
  const stats = {
    total: voters.length,
    willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
    highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
    students: voters.filter(v => v.Student === 'Yes').length
  };

  return (
    <AdminLayout>
      <div className="space-y-4 p-2 sm:p-4 lg:p-6">
        {/* Mobile-First Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">📊 ডেটা হাব</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>মোট ভোটার: <strong>{stats.total}</strong></span>
              </div>
              {isLoading && (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                  <span>লোড হচ্ছে...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: 'মোট ভোটার', value: stats.total, color: 'green', icon: '👥' },
            { label: 'ভোট দেবেন', value: stats.willVote, color: 'blue', icon: '✅' },
            { label: 'উচ্চ অগ্রাধিকার', value: stats.highPriority, color: 'red', icon: '🔥' },
            { label: 'ছাত্র', value: stats.students, color: 'purple', icon: '🎓' }
          ].map((stat, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</p>
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-lg sm:text-xl flex-shrink-0 ml-2">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Mobile-Optimized Field Selection */}
          <div className="lg:col-span-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  ফিল্ড নির্বাচন করুন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto pr-2">
                  {availableFields.map(field => (
                    <div key={field} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <label className="text-xs sm:text-sm cursor-pointer flex-1 truncate" title={field}>
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields(availableFields)}
                    className="text-xs sm:text-sm hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                  >
                    সব নির্বাচন
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields([])}
                    className="text-xs sm:text-sm hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                  >
                    সব বাতিল
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-Optimized Export Options */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                এক্সপোর্ট অপশন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  📋 নির্বাচিত ফিল্ড: <strong>{selectedFields.length}</strong>
                </p>
                <div className="text-xs text-gray-500">
                  {selectedFields.length > 0 ? 
                    selectedFields.slice(0, 3).join(', ') + (selectedFields.length > 3 ? '...' : '') 
                    : 'কোনো ফিল্ড নির্বাচিত নয়'
                  }
                </div>
              </div>

              <Button
                onClick={exportToCSV}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                disabled={isLoading || selectedFields.length === 0}
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">CSV এ ডাউনলোড</span>
              </Button>

              <Button
                onClick={exportToPDF}
                className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                disabled={isLoading || selectedFields.length === 0}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">PDF এ ডাউনলোড</span>
              </Button>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 text-xs sm:text-sm mb-2">💡 ফাইল তথ্য:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• CSV: এক্সেল/স্প্রেডশিটে খোলা যায়</li>
                  <li>• PDF: প্রিন্ট ও শেয়ারের জন্য উপযুক্ত</li>
                  <li>• ডেভেলপার তথ্য অন্তর্ভুক্ত</li>
                  <li>• প্রফেশনাল ফরম্যাট</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Preview */}
        {selectedFields.length > 0 && (
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center justify-between">
                <span>📋 ডেটা প্রিভিউ (প্রথম ১০ রেকর্ড)</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {selectedFields.length} ফিল্ড
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div style={{ minWidth: '400px' }}>
                  <table className="w-full text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-semibold">ক্রম</th>
                        {selectedFields.map(field => (
                          <th key={field} className="border border-gray-300 p-2 text-left font-semibold whitespace-nowrap">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {voters.slice(0, 10).map((voter, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center font-semibold">{index + 1}</td>
                          {selectedFields.map(field => (
                            <td key={field} className="border border-gray-300 p-2 truncate max-w-24" title={voter[field as keyof VoterData]?.toString()}>
                              {voter[field as keyof VoterData] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {voters.length > 10 && (
                <p className="text-center text-gray-600 mt-4 text-xs sm:text-sm">
                  আরও <strong>{voters.length - 10}</strong> টি রেকর্ড রয়েছে...
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
