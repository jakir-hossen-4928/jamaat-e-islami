
import React, { useState } from 'react';
import { FileText, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    'NID': false,
    'Will Vote': true,
    'Vote Probability (%)': true,
    'Priority Level': true,
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
    'Collector': true,
    'Collection Date': true,
    'Last Updated': false
  });

  const allFields = [
    'Voter Name', 'House Name', 'FatherOrHusband', 'Age', 'Gender', 'Marital Status',
    'Student', 'Occupation', 'Education', 'Religion', 'Phone', 'WhatsApp', 'NID',
    'Is Voter', 'Will Vote', 'Voted Before', 'Vote Probability (%)', 'Political Support',
    'Priority Level', 'Has Disability', 'Is Migrated', 'Remarks', 'Collector', 'Collection Date', 'Last Updated'
  ];

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
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
      
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px;">
          <div class="header" style="text-align: center; margin-bottom: 30px; background: #16a34a; color: white; padding: 20px; border-radius: 8px;">
            <img src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 22px;">বাংলাদেশ জামায়াতে ইসলামী</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 16px; font-weight: normal;">ভোটার ডেটা রিপোর্ট</h2>
            <p style="margin: 10px 0 0 0; font-size: 12px;">তৈরি করা হয়েছে ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 12px;">
            <p><strong>মোট ভোটার:</strong> ${voters.length}</p>
            <p><strong>তৈরিকারী:</strong> ${userProfile?.displayName} (${userProfile?.role?.toUpperCase()})</p>
            <p><strong>ডেটা সোর্স:</strong> Firebase Firestore</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px;">
            <thead>
              <tr style="background-color: #16a34a; color: white;">
                ${selectedFieldsList.map(field => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; word-wrap: break-word;">${field}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${voters.map((voter, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  ${selectedFieldsList.map(field => `<td style="border: 1px solid #ddd; padding: 6px; font-size: 9px; word-wrap: break-word; overflow-wrap: break-word; max-width: 120px;">${voter[field as keyof VoterData] || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10px; page-break-inside: avoid;">
            <p>© 2025 বাংলাদেশ জামায়াতে ইসলামী। সকল অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      `;

      const style = document.createElement('style');
      style.textContent = `
        @media print {
          @page { 
            margin: 0.5in; 
            size: A4 portrait; 
          }
          .header, th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            max-width: 120px !important;
          }
          thead {
            display: table-header-group;
          }
        }
      `;
      element.appendChild(style);

      const options = {
        margin: 0.5,
        filename: `voter-data-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.9 },
        html2canvas: { 
          scale: 1.2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(options).from(element).save();
      
      toast({
        title: "PDF সফলভাবে তৈরি হয়েছে",
        description: `${voters.length} জন ভোটারের তথ্য PDF এ এক্সপোর্ট করা হয়েছে`,
      });
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF তৈরি করতে ব্যর্থ",
        description: error.message || "PDF তৈরি করতে সমস্যা হয়েছে",
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
        <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs shadow-lg hover:bg-green-50 hover:text-green-700 hover:border-green-300">
          <FileText className="w-3 h-3" />
          PDF এক্সপোর্ট
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            PDF এক্সপোর্ট সেটিংস
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">যে ফিল্ডগুলি অন্তর্ভুক্ত করতে চান তা নির্বাচন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {allFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields[field]}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label htmlFor={field} className="text-sm cursor-pointer">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="hover:bg-gray-50">
            বাতিল
          </Button>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'তৈরি হচ্ছে...' : 'PDF তৈরি করুন'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedPDFGenerator;
