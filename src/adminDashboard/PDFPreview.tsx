
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Smartphone, Monitor } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';
import AdvancedPDFGenerator from '@/components/AdvancedPDFGenerator';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VoterData } from '@/lib/types';

const PDFPreview = () => {
  usePageTitle('পিডিএফ প্রিভিউ - জামায়াতে ইসলামী');
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');

  const { data: voters = [] } = useQuery({
    queryKey: ['voters'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    }
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/voters')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ফিরে যান
                  </Button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      পিডিএফ প্রিভিউ
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">ভোটার তালিকার পিডিএফ প্রিভিউ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AdvancedPDFGenerator voters={voters} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Mode Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">প্রিভিউ মোড</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('desktop')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  ডেস্কটপ
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('mobile')}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  মোবাইল
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Container */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {previewMode === 'mobile' ? 'মোবাইল প্রিভিউ' : 'ডেস্কটপ প্রিভিউ'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`
                ${previewMode === 'mobile' 
                  ? 'max-w-sm mx-auto border-2 border-gray-300 rounded-lg p-4 bg-white shadow-lg' 
                  : 'w-full border border-gray-200 rounded-lg p-6 bg-white'
                }
              `}>
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className={`font-bold text-green-600 ${previewMode === 'mobile' ? 'text-lg' : 'text-2xl'}`}>
                      জামায়াতে ইসলামী
                    </h2>
                    <p className={`text-gray-600 ${previewMode === 'mobile' ? 'text-sm' : 'text-base'}`}>
                      ভোটার তালিকা
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className={`grid gap-2 ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                      <div className="flex justify-between">
                        <span className="font-medium">মোট ভোটার:</span>
                        <span>{voters.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ভোট দেবেন:</span>
                        <span>{voters.filter(v => v['Will Vote'] === 'Yes').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">উচ্চ অগ্রাধিকার:</span>
                        <span>{voters.filter(v => v['Priority Level'] === 'High').length}</span>
                      </div>
                    </div>
                  </div>

                  {previewMode === 'desktop' && (
                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600">
                        <p>এটি একটি নমুনা প্রিভিউ। প্রকৃত পিডিএফে সম্পূর্ণ ভোটার তালিকা থাকবে।</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PDFPreview;
