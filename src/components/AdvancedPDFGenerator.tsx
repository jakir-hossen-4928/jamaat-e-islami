import React, { useState } from 'react';
import { FileText, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VoterData } from '@/lib/types';
import html2pdf from 'html2pdf.js';

const AdvancedPDFGenerator = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    'Voter Name': true,
    'House Name': true,
    'FatherOrHusband': true,
    'Age': true,
    'Gender': true,
    'Phone': true,
    'Will Vote': true,
    'Vote Probability (%)': true,
    'Priority Level': true,
    'NID': false,
    'Political Support': false,
    'Education': false,
    'Occupation': false,
    'Marital Status': false,
    'Religion': false,
    'Student': false,
    'WhatsApp': false,
    'Is Voter': false,
    'Voted Before': false,
    'Has Disability': false,
    'Is Migrated': false,
    'Remarks': false,
    'Collector': false,
    'Collection Date': false,
    'Last Updated': false
  });

  const allFields = [
    'Voter Name', 'House Name', 'FatherOrHusband', 'Age', 'Gender', 'Marital Status',
    'Student', 'Occupation', 'Education', 'Religion', 'Phone', 'WhatsApp', 'NID',
    'Is Voter', 'Will Vote', 'Voted Before', 'Vote Probability (%)', 'Political Support',
    'Priority Level', 'Has Disability', 'Is Migrated', 'Remarks', 'Collector', 'Collection Date', 'Last Updated'
  ];

  const handleFieldToggle = (field: string) => {
    const selectedCount = Object.values(selectedFields).filter(Boolean).length;
    if (selectedFields[field] || selectedCount < 9) {
      setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    } else {
      toast({
        title: "সীমা অতিক্রম",
        description: "আপনি সর্বাধিক ৯টি কলাম নির্বাচন করতে পারেন।",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    if (userProfile?.role !== 'admin') {
      toast({
        title: "অ্যাক্সেস অস্বীকৃত",
        description: "শুধুমাত্র অ্যাডমিন ব্যবহারকারীরা সমস্ত ভোটার ডেটা এক্সপোর্ট করতে পারেন।",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('📊 Fetching all voters from Firebase for PDF generation');
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      const selectedFieldsList = allFields.filter(field => selectedFields[field]);
      const currentDate = new Date();
      const formatDate = currentDate.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formatTime = currentDate.toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Calculate statistics
      const stats = {
        total: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
        students: voters.filter(v => v.Student === 'Yes').length,
        avgAge: Math.round(voters.reduce((sum, v) => sum + (v.Age || 0), 0) / voters.length),
        maleCount: voters.filter(v => v.Gender === 'Male').length,
        femaleCount: voters.filter(v => v.Gender === 'Female').length
      };
      
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 25px; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; line-height: 1.4; color: #2c3e50;">
          <!-- Professional Header -->
          <div class="header" style="text-align: center; margin-bottom: 25px; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <img src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" alt="জামায়াত লোগো" style="width: 60px; height: 60px; margin-right: 15px; border: 2px solid white; border-radius: 50%; padding: 5px; background: white;">
              <div style="text-align: left;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">বাংলাদেশ জামায়াতে ইসলামী</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">কাকৈর খোলা, চৌদ্দগ্রাম শাখা</p>
              </div>
            </div>
            <h2 style="margin: 15px 0 5px 0; font-size: 20px; font-weight: normal; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">ভোটার ডেটা বিশ্লেষণ রিপোর্ট</h2>
            <div style="display: flex; justify-content: center; gap: 30px; margin-top: 15px; font-size: 13px;">
              <div><strong>তারিখ:</strong> ${formatDate}</div>
              <div><strong>সময়:</strong> ${formatTime}</div>
              <div><strong>রিপোর্ট ID:</strong> #${Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          <!-- Executive Summary -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 15px 0; color: #16a34a; font-size: 16px; font-weight: bold;">নির্বাহী সারসংক্ষেপ</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.total}</div>
                <div style="color: #64748b; font-size: 12px;">মোট নিবন্ধিত ভোটার</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${stats.willVote} (${Math.round((stats.willVote/stats.total)*100)}%)</div>
                <div style="color: #64748b; font-size: 12px;">ভোট দেবেন</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.highPriority}</div>
                <div style="color: #64748b; font-size: 12px;">উচ্চ অগ্রাধিকার</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${stats.avgAge} বছর</div>
                <div style="color: #64748b; font-size: 12px;">গড় বয়স</div>
              </div>
            </div>
            <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <strong>লিঙ্গ বন্টন:</strong> পুরুষ ${stats.maleCount} জন (${Math.round((stats.maleCount/stats.total)*100)}%), মহিলা ${stats.femaleCount} জন (${Math.round((stats.femaleCount/stats.total)*100)}%)
            </div>
          </div>

          <!-- Report Details -->
          <div style="margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: bold;">রিপোর্ট বিবরণ</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; font-size: 11px;">
              <div><strong>তৈরিকারী:</strong> ${userProfile?.displayName || 'অজানা'} (${userProfile?.role?.toUpperCase() || 'USER'})</div>
              <div><strong>নির্বাচিত ফিল্ড:</strong> ${selectedFieldsList.length}টি</div>
            </div>
          </div>

          <!-- Data Table -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 14px; font-weight: bold; padding-bottom: 8px; border-bottom: 2px solid #16a34a;">বিস্তারিত ভোটার তথ্য</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white;">
                  <th style="border: 1px solid #059669; padding: 8px; text-align: left; font-size: 9px; font-weight: bold;">ক্রম</th>
                  ${selectedFieldsList.map(field => `<th style="border: 1px solid #059669; padding: 8px; text-align: left; font-size: 9px; font-weight: bold; white-space: nowrap;">${field}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${voters.map((voter, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : 'white'}; border-bottom: 1px solid #e2e8f0;">
                    <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 9px; text-align: center; font-weight: bold; color: #374151;">${index + 1}</td>
                    ${selectedFieldsList.map(field => {
                      let value = voter[field as keyof VoterData] || '-';
                      let cellStyle = 'border: 1px solid #e2e8f0; padding: 6px; font-size: 9px; word-wrap: break-word; max-width: 80px;';
                      
                      // Special formatting for certain fields
                      if (field === 'Priority Level') {
                        if (value === 'High') cellStyle += ' background-color: #fee2e2; color: #991b1b; font-weight: bold;';
                        else if (value === 'Medium') cellStyle += ' background-color: #fef3c7; color: #92400e; font-weight: bold;';
                        else if (value === 'Low') cellStyle += ' background-color: #f3f4f6; color: #374151;';
                      } else if (field === 'Will Vote' && value === 'Yes') {
                        cellStyle += ' background-color: #dcfce7; color: #166534; font-weight: bold;';
                        value = '✓ হ্যাঁ';
                      } else if (field === 'Will Vote' && value === 'No') {
                        cellStyle += ' background-color: #fee2e2; color: #991b1b;';
                        value = '✗ না';
                      } else if (field === 'Vote Probability (%)' && value !== '-') {
                        const numValue = parseInt(value.toString());
                        if (numValue >= 80) cellStyle += ' background-color: #dcfce7; color: #166534; font-weight: bold;';
                        else if (numValue >= 60) cellStyle += ' background-color: #fef3c7; color: #92400e;';
                        else cellStyle += ' background-color: #fee2e2; color: #991b1b;';
                        value = value + '%';
                      }
                      
                      return `<td style="${cellStyle}">${value}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Professional Footer -->
          <div style="margin-top: 25px; padding: 20px; text-align: center; background: #f8fafc; border-radius: 8px; border-top: 3px solid #16a34a;">
            <div style="margin-bottom: 10px;">
              <strong style="color: #16a34a; font-size: 12px;">বাংলাদেশ জামায়াতে ইসলামী - কাকৈর খোলা, চৌদ্দগ্রাম শাখা</strong>
            </div>
            <div style="font-size: 10px; color: #64748b; line-height: 1.6;">
              <div>📍 কাকৈর খোলা, চৌদ্দগ্রাম, কুমিল্লা | 📱 01647470849</div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                <strong>গোপনীয়তা নোটিস:</strong> এই রিপোর্টটি গোপনীয় এবং শুধুমাত্র অনুমোদিত ব্যক্তিদের জন্য। অনুমতি ছাড়া কোনো তথ্য ব্যবহার বা বিতরণ করা যাবে না।
              </div>
              <div style="margin-top: 5px; font-size: 9px;">
                © ${new Date().getFullYear()} জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত। | সিস্টেম ভার্সন: 2.1.0 | রিপোর্ট জেনারেটেড: ${formatDate} ${formatTime}
              </div>
              <div style="margin-top: 5px; font-size: 9px; font-weight: bold;">
                Powered by Jakir Hossen
              </div>
            </div>
          </div>
        </div>
      `;

      // Enhanced CSS for print optimization
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          @page { 
            margin: 0.4in; 
            size: A4 portrait; 
          }
          .header, th, .summary-card {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          table {
            font-size: 8px !important;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          td, th {
            font-size: 8px !important;
            padding: 4px !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 80px !important;
          }
          thead {
            display: table-header-group;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #059669 100%) !important;
          }
          div[style*="background: linear-gradient"] {
            background: #16a34a !important;
          }
        }
        @media screen {
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          td, th { word-wrap: break-word; overflow-wrap: break-word; }
        }
      `;
      element.appendChild(style);

      const options = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `জামায়াত-ভোটার-রিপোর্ট-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 2
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after'
        }
      };

      await html2pdf().set(options).from(element).save();
      
      toast({
        title: "✅ PDF সফলভাবে তৈরি হয়েছে",
        description: `${voters.length} জন ভোটারের তথ্য প্রফেশনাল PDF রিপোর্টে এক্সপোর্ট করা হয়েছে।`,
      });
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "❌ PDF তৈরি করতে ব্যর্থ",
        description: error.message || "PDF তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (userProfile?.role !== 'admin') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs shadow-md hover:shadow-lg hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200">
          <FileText className="w-3 h-3" />
          <span className="hidden sm:inline">PDF এক্সপোর্ট</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-lg md:max-w-2xl mx-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            প্রফেশনাল PDF রিপোর্ট সেটিংস
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-lg">যে ফিল্ডগুলি অন্তর্ভুক্ত করতে চান তা নির্বাচন করুন (সর্বাধিক ৯টি)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto pr-2">
              {allFields.map((field) => (
                <div key={field} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={field}
                    checked={selectedFields[field]}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label htmlFor={field} className="text-xs sm:text-sm cursor-pointer flex-1">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 text-sm mb-2">📋 রিপোর্টের বৈশিষ্ট্য:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• প্রফেশনাল হেডার ও ফুটার ডিজাইন</li>
            <li>• নির্বাহী সারসংক্ষেপ ও পরিসংখ্যান</li>
            <li>• মোবাইল-বান্ধব ও প্রিন্ট-অপ্টিমাইজড</li>
            <li>• নেতৃত্বের জন্য উপযুক্ত ফরম্যাট</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="hover:bg-gray-50 text-sm">
            বাতিল
          </Button>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating} 
            className="bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '📄 তৈরি হচ্ছে...' : '📊 প্রফেশনাল PDF তৈরি করুন'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedPDFGenerator;
