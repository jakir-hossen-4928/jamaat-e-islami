import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, BarChart3, Settings, Eye, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { canAccessLocation } from '@/lib/rbac';
import Papa from 'papaparse';
import html2pdf from 'html2pdf.js';

const DataHub = () => {
  usePageTitle('ডেটা হাব - এক্সপোর্ট সেন্টার');
  
  const { userProfile } = useAuth();
  const { locationData, selectedLocation, setSelectedLocation, isLoading: locationLoading } = useLocationFilter();
  
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'Voter Name',
    'Phone',
    'Age',
    'Gender'
  ]);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const { toast } = useToast();

  const { data: allVoters = [], isLoading } = useQuery({
    queryKey: ['voters', 'data-hub', selectedLocation],
    queryFn: async () => {
      if (!userProfile) return [];
      
      const votersRef = collection(db, 'voters');
      let votersQuery = query(votersRef);

      // Apply location-based filtering for non-super admins
      if (userProfile.role !== 'super_admin') {
        const scope = userProfile.accessScope;
        const filters = [];
        
        if (scope.division_id) filters.push(where('division_id', '==', scope.division_id));
        if (scope.district_id) filters.push(where('district_id', '==', scope.district_id));
        if (scope.upazila_id) filters.push(where('upazila_id', '==', scope.upazila_id));
        if (scope.union_id) filters.push(where('union_id', '==', scope.union_id));
        if (scope.village_id) filters.push(where('village_id', '==', scope.village_id));
        
        if (filters.length > 0) {
          votersQuery = query(votersRef, ...filters);
        }
      }

      const snapshot = await getDocs(votersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    },
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Filter voters based on selected location (for super admin)
  const voters = useMemo(() => {
    if (!allVoters.length) return [];
    
    if (userProfile?.role === 'super_admin' && Object.keys(selectedLocation).length > 0) {
      return allVoters.filter(voter => {
        return Object.entries(selectedLocation).every(([key, value]) => {
          if (!value) return true;
          return voter[key as keyof VoterData] === value;
        });
      });
    }
    
    return allVoters;
  }, [allVoters, selectedLocation, userProfile]);

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
      <div className="space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6">
        {/* Mobile-First Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              📊 ডেটা হাব
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>মোট ভোটার: <strong className="text-green-600">{stats.total}</strong></span>
              </div>
              {(isLoading || locationLoading) && (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                  <span>লোড হচ্ছে...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Filter for Super Admin */}
        {userProfile?.role === 'super_admin' && (
          <Card className="shadow-md border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  এলাকা ভিত্তিক ফিল্টার
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationFilter(!showLocationFilter)}
                >
                  {showLocationFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            {showLocationFilter && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">বিভাগ</label>
                    <Select
                      value={selectedLocation.division_id || ""}
                      onValueChange={(value) => setSelectedLocation({ ...selectedLocation, division_id: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">সব বিভাগ</SelectItem>
                        {locationData.divisions.map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">জেলা</label>
                    <Select
                      value={selectedLocation.district_id || ""}
                      onValueChange={(value) => setSelectedLocation({ ...selectedLocation, district_id: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="জেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">সব জেলা</SelectItem>
                        {locationData.districts
                          .filter(district => !selectedLocation.division_id || district.division_id === selectedLocation.division_id)
                          .map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">উপজেলা</label>
                    <Select
                      value={selectedLocation.upazila_id || ""}
                      onValueChange={(value) => setSelectedLocation({ ...selectedLocation, upazila_id: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">সব উপজেলা</SelectItem>
                        {locationData.upazilas
                          .filter(upazila => !selectedLocation.district_id || upazila.district_id === selectedLocation.district_id)
                          .map((upazila) => (
                          <SelectItem key={upazila.id} value={upazila.id}>
                            {upazila.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLocation({})}
                    className="text-xs"
                  >
                    ফিল্টার রিসেট করুন
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Mobile-Optimized Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'মোট ভোটার', value: stats.total, color: 'green', icon: '👥', bgColor: 'bg-green-50', textColor: 'text-green-700' },
            { label: 'ভোট দেবেন', value: stats.willVote, color: 'blue', icon: '✅', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
            { label: 'উচ্চ অগ্রাধিকার', value: stats.highPriority, color: 'red', icon: '🔥', bgColor: 'bg-red-50', textColor: 'text-red-700' },
            { label: 'ছাত্র', value: stats.students, color: 'purple', icon: '🎓', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
          ].map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className={`${stat.bgColor} rounded-lg p-2 sm:p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-600 truncate">{stat.label}</p>
                      <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-lg sm:text-xl flex-shrink-0 ml-2">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile-First Action Panel */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                এক্সপোর্ট কন্ট্রোল প্যানেল
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                {selectedFields.length} ফিল্ড নির্বাচিত
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFields(['Voter Name', 'Phone', 'Age', 'Gender'])}
                className="text-xs hover:bg-green-50 hover:border-green-300"
              >
                🎯 মূল তথ্য
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFields(['Voter Name', 'Phone', 'NID', 'Will Vote'])}
                className="text-xs hover:bg-blue-50 hover:border-blue-300"
              >
                🗳️ ভোটিং তথ্য
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFields(availableFields)}
                className="text-xs hover:bg-purple-50 hover:border-purple-300"
              >
                📋 সব তথ্য
              </Button>
            </div>

            {/* Field Selector Toggle */}
            <Button
              variant="ghost"
              onClick={() => setShowFieldSelector(!showFieldSelector)}
              className="w-full justify-between text-sm hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ফিল্ড নির্বাচন করুন
              </span>
              {showFieldSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {/* Collapsible Field Selector */}
            {showFieldSelector && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableFields.map(field => (
                    <div key={field} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                        className="flex-shrink-0"
                      />
                      <label className="text-xs cursor-pointer flex-1 truncate" title={field}>
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields(availableFields)}
                    className="text-xs hover:bg-green-50"
                  >
                    সব নির্বাচন
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields([])}
                    className="text-xs hover:bg-red-50"
                  >
                    সব বাতিল
                  </Button>
                </div>
              </div>
            )}

            {/* Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={exportToCSV}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || selectedFields.length === 0}
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">CSV ডাউনলোড</span>
              </Button>

              <Button
                onClick={exportToPDF}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || selectedFields.length === 0}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">PDF ডাউনলোড</span>
              </Button>
            </div>

            {/* Preview Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full justify-between hover:bg-blue-50"
              disabled={selectedFields.length === 0}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                ডেটা প্রিভিউ
              </span>
              {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Preview */}
        {showPreview && selectedFields.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                <span>📋 ডেটা প্রিভিউ (প্রথম ১০ রেকর্ড)</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {selectedFields.length} ফিল্ড
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div style={{ minWidth: `${Math.max(400, selectedFields.length * 120)}px` }}>
                  <table className="w-full text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="border border-gray-300 p-2 text-left font-semibold text-green-800 sticky left-0 bg-green-50 z-10">
                          ক্রম
                        </th>
                        {selectedFields.map(field => (
                          <th key={field} className="border border-gray-300 p-2 text-left font-semibold whitespace-nowrap text-green-800">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {voters.slice(0, 10).map((voter, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center font-semibold sticky left-0 bg-white z-10">
                            {index + 1}
                          </td>
                          {selectedFields.map(field => (
                            <td key={field} className="border border-gray-300 p-2 truncate max-w-32" title={voter[field as keyof VoterData]?.toString()}>
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
                <p className="text-center text-gray-600 mt-3 text-xs sm:text-sm">
                  আরও <strong>{voters.length - 10}</strong> টি রেকর্ড রয়েছে...
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
            💡 ব্যবহারের নির্দেশনা
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-700">
            <div>
              <strong>📱 মোবাইলে:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>টাচ করে ফিল্ড নির্বাচন করুন</li>
                <li>দ্রুত সিলেকশন বোতাম ব্যবহার করুন</li>
                <li>প্রিভিউ টেবিল স্ক্রোল করুন</li>
              </ul>
            </div>
            <div>
              <strong>💻 ডেস্কটপে:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>একাধিক ফিল্ড একসাথে নির্বাচন</li>
                <li>বড় প্রিভিউ টেবিল দেখুন</li>
                <li>দ্রুত এক্সপোর্ট করুন</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DataHub;
