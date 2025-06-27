
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileText, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface VoterData {
  id: string;
  'Voter Name': string;
  Phone?: string;
  Age?: number;
  Gender?: string;
  'Priority Level'?: string;
  'Political Support'?: string;
  'Is Voter'?: string;
  'Will Vote'?: string;
  Occupation?: string;
  Education?: string;
  Address?: string;
  NID?: string;
  Remarks?: string;
}

interface PDFGeneratorProps {
  voters: VoterData[];
  title?: string;
}

const AdvancedPDFGenerator: React.FC<PDFGeneratorProps> = ({ voters, title = 'ভোটারদের তালিকা' }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'Voter Name', 'Phone', 'Age', 'Gender', 'Priority Level'
  ]);
  const [pdfTitle, setPdfTitle] = useState(title);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [fontSize, setFontSize] = useState('12');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const availableFields = [
    { key: 'Voter Name', label: 'ভোটারের নাম' },
    { key: 'Phone', label: 'ফোন' },
    { key: 'Age', label: 'বয়স' },
    { key: 'Gender', label: 'লিঙ্গ' },
    { key: 'Priority Level', label: 'অগ্রাধিকার' },
    { key: 'Political Support', label: 'রাজনৈতিক সমর্থন' },
    { key: 'Is Voter', label: 'ভোটার কিনা' },
    { key: 'Will Vote', label: 'ভোট দেবেন' },
    { key: 'Occupation', label: 'পেশা' },
    { key: 'Education', label: 'শিক্ষা' },
    { key: 'NID', label: 'NID' },
    { key: 'Remarks', label: 'মন্তব্য' }
  ];

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('bn-BD');
    
    return `
      <div style="font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 100%; margin: 0 auto;">
        ${includeHeader ? `
          <header style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 3px solid #059669;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
              <img src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" alt="Logo" style="width: 60px; height: 60px;">
              <div>
                <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">জামায়াতে ইসলামী</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">ভোটার ব্যবস্থাপনা সিস্টেম</p>
              </div>
            </div>
            <h2 style="margin: 15px 0 5px 0; font-size: ${parseInt(fontSize) + 4}px; color: #1f2937; font-weight: 600;">${pdfTitle}</h2>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">তারিখ: ${currentDate} | মোট ভোটার: ${voters.length} জন</p>
          </header>
        ` : ''}
        
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: ${fontSize}px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #059669, #047857); color: white;">
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #d1d5db; width: 40px;">#</th>
                ${selectedFields.map(field => {
                  const fieldLabel = availableFields.find(f => f.key === field)?.label || field;
                  return `<th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #d1d5db; min-width: 100px;">${fieldLabel}</th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${voters.map((voter, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : 'white'}; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 8px; text-align: center; border: 1px solid #d1d5db; font-weight: 500; color: #6b7280;">${index + 1}</td>
                  ${selectedFields.map(field => {
                    const value = voter[field as keyof VoterData];
                    const displayValue = value || '-';
                    return `<td style="padding: 10px 8px; border: 1px solid #d1d5db; word-wrap: break-word; max-width: 150px;">${displayValue}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${includeFooter ? `
          <footer style="margin-top: 30px; padding: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <p style="margin: 0; font-weight: 500;">বাংলাদেশ জামায়াতে ইসলামী</p>
                <p style="margin: 2px 0 0 0;">ভোটার ব্যবস্থাপনা সিস্টেম</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0;">তৈরি: ${new Date().toLocaleString('bn-BD')}</p>
                <p style="margin: 2px 0 0 0;">পৃষ্ঠা: <span class="pageNumber"></span></p>
              </div>
            </div>
          </footer>
        ` : ''}
      </div>
    `;
  };

  const generatePDF = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'অন্তত একটি ফিল্ড নির্বাচন করুন',
        variant: 'destructive',
      });
      return;
    }

    if (voters.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'পিডিএফ তৈরি করার জন্য কোন ভোটার নেই',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const content = generatePDFContent();
      const element = document.createElement('div');
      element.innerHTML = content;
      
      const opt = {
        margin: [15, 10, 15, 10],
        filename: `${pdfTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: pageSize, 
          orientation: orientation,
          putOnlyUsedFonts: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: 'সফল',
        description: 'PDF সফলভাবে তৈরি এবং ডাউনলোড হয়েছে',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'ত্রুটি',
        description: 'PDF তৈরি করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-5 h-5" />
            পিডিএফ সেটিংস
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="pdfTitle" className="text-sm font-medium">পিডিএফ শিরোনাম</Label>
              <Input
                id="pdfTitle"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                className="mt-1"
                placeholder="পিডিএফের শিরোনাম"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">পেজ সাইজ</Label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">অরিয়েন্টেশন</Label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">পোর্ট্রেট</SelectItem>
                  <SelectItem value="landscape">ল্যান্ডস্কেপ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">ফন্ট সাইজ</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">১০px</SelectItem>
                  <SelectItem value="12">১২px</SelectItem>
                  <SelectItem value="14">১৪px</SelectItem>
                  <SelectItem value="16">১৬px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Header/Footer Options */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHeader"
                checked={includeHeader}
                onCheckedChange={setIncludeHeader}
              />
              <Label htmlFor="includeHeader" className="text-sm">হেডার অন্তর্ভুক্ত করুন</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFooter"
                checked={includeFooter}
                onCheckedChange={setIncludeFooter}
              />
              <Label htmlFor="includeFooter" className="text-sm">ফুটার অন্তর্ভুক্ত করুন</Label>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">পিডিএফে অন্তর্ভুক্ত করার জন্য ফিল্ড নির্বাচন করুন:</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'প্রিভিউ লুকান' : 'প্রিভিউ দেখুন'}
            </Button>
            
            <Button
              onClick={generatePDF}
              disabled={isGenerating || selectedFields.length === 0}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 flex-1 sm:flex-initial"
            >
              {isGenerating ? (
                'তৈরি হচ্ছে...'
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  পিডিএফ ডাউনলোড করুন
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      {showPreview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="w-5 h-5" />
              পিডিএফ প্রিভিউ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-4 bg-white max-h-96 overflow-auto text-sm"
              style={{ fontFamily: 'SolaimanLipi, Noto Sans Bengali, Arial, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: generatePDFContent() }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPDFGenerator;
