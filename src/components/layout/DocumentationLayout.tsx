
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Book, 
  FileText, 
  Settings, 
  Users, 
  MapPin, 
  BarChart3, 
  MessageSquare,
  Database,
  Home,
  Menu,
  Code
} from 'lucide-react';

interface DocumentationLayoutProps {
  children: React.ReactNode;
}

const DocumentationLayout = ({ children }: DocumentationLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: 'শুরু করুন', path: '/docs' },
    { icon: Users, label: 'ভোটার ব্যবস্থাপনা', path: '/docs/voter-management' },
    { icon: MapPin, label: 'এলাকা ব্যবস্থাপনা', path: '/docs/location-management' },
    { icon: BarChart3, label: 'বিশ্লেষণ সিস্টেম', path: '/docs/analytics' },
    { icon: MessageSquare, label: 'SMS ক্যাম্পেইন', path: '/docs/sms-campaign' },
    { icon: Database, label: 'ডেটা হাব', path: '/docs/data-hub' },
    { icon: Settings, label: 'সিস্টেম সেটিংস', path: '/docs/system-settings' },
    { icon: Code, label: 'API রেফারেন্স', path: '/docs/api-reference' }
  ];

  const NavigationContent = () => (
    <nav className="space-y-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 mr-3" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex items-center space-x-2 p-4 border-b">
                    <img
                      src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
                      alt="Logo"
                      className="w-8 h-8"
                    />
                    <span className="text-lg font-bold text-gray-900">ডকুমেন্টেশন</span>
                  </div>
                  <NavigationContent />
                </SheetContent>
              </Sheet>

              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
                  alt="Logo"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900">জামায়াতে ইসলামী</span>
              </Link>
              <span className="text-gray-400 hidden sm:block">|</span>
              <span className="text-lg font-medium text-gray-700 hidden sm:block">ডকুমেন্টেশন</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="p-0">
                <NavigationContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">সিস্টেম</h3>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-gray-600 hover:text-gray-900">ডকুমেন্টেশন</Link></li>
                <li><Link to="/docs/api-reference" className="text-gray-600 hover:text-gray-900">API রেফারেন্স</Link></li>
                <li><Link to="/dashboard" className="text-gray-600 hover:text-gray-900">ড্যাশবোর্ড</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ফিচার</h3>
              <ul className="space-y-2">
                <li><Link to="/docs/voter-management" className="text-gray-600 hover:text-gray-900">ভোটার ব্যবস্থাপনা</Link></li>
                <li><Link to="/docs/location-management" className="text-gray-600 hover:text-gray-900">এলাকা ব্যবস্থাপনা</Link></li>
                <li><Link to="/docs/analytics" className="text-gray-600 hover:text-gray-900">বিশ্লেষণ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">যোগাযোগ</h3>
              <p className="text-gray-600">
                জামায়াতে ইসলামী বাংলাদেশ<br />
                ভোটার ব্যবস্থাপনা সিস্টেম
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentationLayout;
