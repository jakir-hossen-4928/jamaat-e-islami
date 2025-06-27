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
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
    { icon: Users, label: 'সকল ভোটার', path: '/admin/voters' },
    { icon: UserPlus, label: 'ভোটার যোগ করুন', path: '/admin/add-voter' },
    { icon: Upload, label: 'বাল্ক আপলোড', path: '/admin/bulk-upload' },
    { icon: BarChart3, label: 'পরিসংখ্যান', path: '/admin/analytics' },
    { icon: Database, label: 'ডেটা হাব', path: '/admin/data-hub' },
    { icon: MessageSquare, label: 'এসএমএস ক্যাম্পেইন', path: '/admin/sms-campaign-new' },
    { icon: FileText, label: 'গুগল ফর্ম', path: '/admin/google-form' },
    { icon: Shield, label: 'ইউজার ভেরিফাই', path: '/admin/verify-users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 flex-shrink-0 transition-width duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`p-3 hover:bg-gray-700 cursor-pointer ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center">
                  <item.icon className="mr-2 w-5 h-5" />
                  <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>
                    {item.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
