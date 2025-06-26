
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Unauthorized = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">অননুমোদিত প্রবেশ</CardTitle>
            <CardDescription>
              আপনার এই পেজে প্রবেশের অনুমতি নেই
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              এই পেজটি দেখার জন্য আপনার প্রয়োজনীয় অনুমতি নেই। অনুগ্রহ করে আপনার এডমিনের সাথে যোগাযোগ করুন।
            </p>
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              লগআউট করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;
