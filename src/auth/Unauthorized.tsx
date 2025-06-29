
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/usePageTitle';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  usePageTitle('অনুমতি নেই - জামায়াতে ইসলামী');
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ShieldX className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            প্রবেশ নিষেধ
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-gray-600">
              দুঃখিত! এই পেজে প্রবেশের অনুমতি আপনার নেই।
            </p>
            <p className="text-sm text-gray-500">
              আপনার অ্যাকাউন্ট এখনও অনুমোদিত হয়নি বা আপনার পর্যাপ্ত অধিকার নেই।
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">সম্ভাব্য কারণ:</h4>
            <ul className="text-sm text-red-700 space-y-1 text-left">
              <li>• আপনার অ্যাকাউন্ট এখনও অনুমোদিত হয়নি</li>
              <li>• আপনার এই সেকশনে প্রবেশের অধিকার নেই</li>
              <li>• আপনার ভূমিকা যথেষ্ট নয়</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              পূর্ববর্তী পেজে ফিরুন
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              হোমে ফিরুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
