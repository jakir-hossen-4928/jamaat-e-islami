
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  Upload,
  BarChart3,
  Database,
  MessageSquare,
  Shield,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "সফল",
        description: "সফলভাবে লগআউট হয়েছেন",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লগআউট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
    { icon: Users, label: 'সকল ভোটার', path: '/admin/voters' },
    { icon: UserPlus, label: 'ভোটার যোগ করুন', path: '/admin/add-voter' },
    { icon: Upload, label: 'বাল্ক আপলোড', path: '/admin/bulk-upload' },
    { icon: BarChart3, label: 'পরিসংখ্যান', path: '/admin/analytics' },
    { icon: Database, label: 'ডেটা হাব', path: '/admin/data-hub' },
    { icon: MessageSquare, label: 'এসএমএস ক্যাম্পেইন', path: '/admin/sms-campaign' },
    { icon: FileText, label: 'গুগল ফর্ম', path: '/admin/google-form' },
    { icon: Shield, label: 'ইউজার ভেরিফাই', path: '/admin/verify-users' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          
          {/* Mobile User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2"
            >
              <User className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {isUserMenuOpen && (
              <Card className="absolute right-0 top-full mt-2 w-64 shadow-lg z-50">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium text-sm text-gray-900">
                        {userProfile?.email || 'ব্যবহারকারী'}
                      </p>
                      <Badge className={`text-xs mt-1 ${getRoleBadgeColor(userProfile?.role || 'user')}`}>
                        {userProfile?.role === 'admin' ? 'অ্যাডমিন' : 
                         userProfile?.role === 'moderator' ? 'মডারেটর' : 'ব্যবহারকারী'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          bg-gray-800 text-white w-64 flex-shrink-0 transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-white hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop User Info */}
        <div className="hidden lg:block p-4 border-b border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userProfile?.email || 'ব্যবহারকারী'}
                </p>
                <Badge className={`text-xs ${getRoleBadgeColor(userProfile?.role || 'user')}`}>
                  {userProfile?.role === 'admin' ? 'অ্যাডমিন' : 
                   userProfile?.role === 'moderator' ? 'মডারেটর' : 'ব্যবহারকারী'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                    location.pathname === item.path ? 'bg-gray-700 text-green-400' : 'text-gray-300'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto bg-gray-100 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
