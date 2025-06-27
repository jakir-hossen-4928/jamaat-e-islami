
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, ExternalLink, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';
import { Button } from '@/components/ui/button';

const GoogleForm = () => {
  usePageTitle('গুগল ফর্ম - ভোটার রেজিস্ট্রেশন');
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Google Form embed URL
  const formUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSfTXOzBLldvEGgfpSeARCQolp-1Lr2hl-GY1CwlUbAyc69NOA/viewform?embedded=true';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    toast({
      title: 'ত্রুটি',
      description: 'ভোটার রেজিস্ট্রেশন ফর্ম লোড করতে ব্যর্থ। পরে আবার চেষ্টা করুন।',
      variant: 'destructive',
    });
  };

  const openInNewTab = () => {
    window.open(formUrl.replace('?embedded=true', ''), '_blank');
  };

  return (
    <AdminLayout>
      <div className="space-y-4 p-2 sm:p-4 lg:p-6">
        {/* Mobile-First Header */}
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              ভোটার রেজিস্ট্রেশন ফর্ম
            </h1>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={openInNewTab}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-xs sm:text-sm">নতুন ট্যাবে খুলুন</span>
              </Button>
              
              {/* View Mode Toggle - Only on larger screens */}
              <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('mobile')}
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1 px-3 py-1 text-xs"
                >
                  <Smartphone className="w-3 h-3" />
                  মোবাইল
                </Button>
                <Button
                  onClick={() => setViewMode('desktop')}
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1 px-3 py-1 text-xs"
                >
                  <Monitor className="w-3 h-3" />
                  ডেস্কটপ
                </Button>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
            <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
              📝 এই ফর্মটি ব্যবহার করে নতুন ভোটারদের তথ্য সংগ্রহ করুন। ফর্মটি সম্পূর্ণভাবে মোবাইল এবং ডেস্কটপ বান্ধব।
            </p>
          </div>
        </div>

        {/* Responsive Form Container */}
        <Card className="w-full shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-50">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-green-600 mx-auto" />
                  <p className="text-sm sm:text-base text-gray-600">ফর্ম লোড হচ্ছে...</p>
                </div>
              </div>
            )}
            
            {/* Responsive iframe container */}
            <div 
              className={`
                relative w-full transition-all duration-300 ease-in-out
                ${viewMode === 'mobile' && !isLoading ? 'max-w-md mx-auto' : 'max-w-full'}
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              style={{
                height: 'clamp(400px, 70vh, 800px)',
                minHeight: '400px'
              }}
            >
              <iframe
                src={formUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Voter Registration Form - ভোটার রেজিস্ট্রেশন ফর্ম"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                className="rounded-lg border-0 bg-white"
                style={{
                  transform: viewMode === 'mobile' ? 'scale(0.9)' : 'scale(1)',
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease-in-out'
                }}
                allow="camera; microphone; geolocation"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 lg:hidden">
          <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            মোবাইল ব্যবহারকারীদের জন্য টিপস
          </h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>ফর্মটি সম্পূর্ণ করতে স্ক্রোল করুন</li>
            <li>সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন</li>
            <li>জমা দেওয়ার আগে তথ্য যাচাই করুন</li>
          </ul>
        </div>

        {/* Desktop Instructions */}
        <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            ডেস্কটপ ব্যবহারকারীদের জন্য নির্দেশনা
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>✅ সুবিধা:</strong>
              <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                <li>বড় স্ক্রিনে সহজ নেভিগেশন</li>
                <li>দ্রুত ডেটা এন্ট্রি</li>
                <li>ভিউ মোড পরিবর্তন করুন</li>
              </ul>
            </div>
            <div>
              <strong>🔧 ব্যবহার:</strong>
              <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                <li>"নতুন ট্যাবে খুলুন" বোতাম ব্যবহার করুন</li>
                <li>মোবাইল/ডেস্কটপ ভিউ টগল করুন</li>
                <li>ফুল স্ক্রিন অভিজ্ঞতা পান</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GoogleForm;
