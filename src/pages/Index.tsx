
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/lib/usePageTitle";
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  CheckCircle, 
  Star,
  BookOpen,
  FileText,
  Settings,
  Database,
  MapPin,
  UserCheck
} from "lucide-react";

const Index = () => {
  usePageTitle('বাংলাদেশ জামায়াতে ইসলামী - ভোটার ব্যবস্থাপনা সিস্টেম');
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "ভোটার ব্যবস্থাপনা",
      description: "সম্পূর্ণ ভোটার তালিকা এবং তাদের তথ্য ব্যবস্থাপনা",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "বিশ্লেষণ ও রিপোর্ট",
      description: "ভোটারদের পরিসংখ্যান এবং বিস্তারিত বিশ্লেষণ",
      color: "text-green-600"
    },
    {
      icon: MessageSquare,
      title: "SMS ক্যাম্পেইন",
      description: "ভোটারদের সাথে যোগাযোগের জন্য SMS পাঠানো",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "নিরাপত্তা",
      description: "উন্নত নিরাপত্তা ব্যবস্থা এবং ভূমিকা ভিত্তিক অ্যাক্সেস",
      color: "text-red-600"
    }
  ];

  const testimonials = [
    {
      name: "মোহাম্মদ রহিম",
      role: "বিভাগীয় সংগঠক",
      content: "এই সিস্টেম আমাদের কাজকে অনেক সহজ করেছে। এখন সব তথ্য এক জায়গায় পাই।",
      rating: 5
    },
    {
      name: "ফাতেমা খাতুন",
      role: "জেলা সমন্বয়কারী",
      content: "খুবই কার্যকর এবং ব্যবহার বান্ধব। রিপোর্ট তৈরি করা এখন অনেক সহজ।",
      rating: 5
    },
    {
      name: "আব্দুল করিম",  
      role: "উপজেলা সংগঠক",
      content: "SMS ক্যাম্পেইন ফিচার খুবই উপকারী। একসাথে অনেক মানুষের কাছে পৌঁছাতে পারি।",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                alt="জামায়াতে ইসলামী"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-green-700">জামায়াতে ইসলামী</h1>
                <p className="text-xs text-gray-600">ভোটার ব্যবস্থাপনা সিস্টেম</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/docs" className="text-gray-700 hover:text-green-600 transition-colors flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>ডকুমেন্টেশন</span>
              </Link>
              {currentUser ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ড্যাশবোর্ড
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                  >
                    লগইন
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    রেজিস্টার
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              {currentUser ? (
                <Button 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ড্যাশবোর্ড
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  লগইন
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with original design */}
      <Hero />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              মূল বৈশিষ্ট্যসমূহ
            </h2>
            <p className="text-xl text-gray-600">
              আমাদের সিস্টেমের উন্নত বৈশিষ্ট্যগুলি জানুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documentation Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ডকুমেন্টেশন
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              সিস্টেম ব্যবহারের জন্য সহায়িকা এবং গাইড
            </p>
            <Button 
              onClick={() => navigate('/docs')}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              সম্পূর্ণ ডকুমেন্টেশন দেখুন
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <CardTitle>ভোটার ব্যবস্থাপনা</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  কিভাবে ভোটার যোগ করবেন, সম্পাদনা করবেন এবং তালিকা দেখবেন
                </CardDescription>
                <Link to="/docs/voter-management" className="text-green-600 hover:text-green-800 mt-2 inline-block">
                  আরো জানুন →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <CardTitle>এনালিটিক্স</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  রিপোর্ট এবং বিশ্লেষণ কিভাবে ব্যবহার করবেন
                </CardDescription>
                <Link to="/docs/analytics" className="text-green-600 hover:text-green-800 mt-2 inline-block">
                  আরো জানুন →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <CardTitle>SMS ক্যাম্পেইন</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  SMS পাঠানো এবং ক্যাম্পেইন পরিচালনা
                </CardDescription>
                <Link to="/docs/sms-campaign" className="text-green-600 hover:text-green-800 mt-2 inline-block">
                  আরো জানুন →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ব্যবহারকারীদের মতামত
            </h2>
            <p className="text-xl text-gray-600">
              আমাদের সিস্টেম ব্যবহারকারীরা কী বলেন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                  alt="জামায়াতে ইসলামী"  
                  className="w-10 h-10 filter brightness-0 invert"
                />
                <div>
                  <h3 className="text-xl font-bold">বাংলাদেশ জামায়াতে ইসলামী</h3>
                  <p className="text-gray-400">ভোটার ব্যবস্থাপনা সিস্টেম</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                আধুনিক প্রযুক্তির মাধ্যমে গণতান্ত্রিক প্রক্রিয়াকে শক্তিশালী করার লক্ষ্যে তৈরি একটি সম্পূর্ণ সমাধান।
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/docs" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>ডকুমেন্টেশন</span>
                  </Link>
                </li>
                <li>
                  <Link to="/docs/voter-management" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>ভোটার ব্যবস্থাপনা</span>
                  </Link>
                </li>
                <li>
                  <Link to="/docs/analytics" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>এনালিটিক্স</span>
                  </Link>
                </li>
                <li>
                  <Link to="/docs/api-reference" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>API রেফারেন্স</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">সিস্টেম</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/docs/location-management" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>এলাকা ব্যবস্থাপনা</span>
                  </Link>
                </li>
                <li>
                  <Link to="/docs/data-hub" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>ডেটা হাব</span>
                  </Link>
                </li>
                <li>
                  <Link to="/docs/system-settings" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>সিস্টেম সেটিংস</span>  
                  </Link>
                </li>
                <li>
                  <Link to="/docs/sms-campaign" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS ক্যাম্পেইন</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} বাংলাদেশ জামায়াতে ইসলামী। সর্বস্বত্ব সংরক্ষিত।
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">
                  Powered by <strong>Jakir Hossen</strong> | 01647470849
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
