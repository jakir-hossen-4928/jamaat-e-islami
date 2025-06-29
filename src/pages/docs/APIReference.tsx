
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Shield, Database, Users, MapPin } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const APIReference = () => {
  usePageTitle('API রেফারেন্স - জামায়াতে ইসলামী ভোটার সিস্টেম');

  const roleAccessData = [
    { role: 'Super Admin', access: 'সকল ডেটা', scope: 'সর্বোচ্চ অধিকার - সব কিছু' },
    { role: 'Division Admin', access: 'বিভাগের সকল ডেটা', scope: 'বিভাগ, জেলা, উপজেলা, ইউনিয়ন, গ্রাম' },
    { role: 'District Admin', access: 'জেলার সকল ডেটা', scope: 'জেলা, উপজেলা, ইউনিয়ন, গ্রাম' },
    { role: 'Upazila Admin', access: 'উপজেলার সকল ডেটা', scope: 'উপজেলা, ইউনিয়ন, গ্রাম' },
    { role: 'Union Admin', access: 'ইউনিয়নের সকল ডেটা', scope: 'ইউনিয়ন, গ্রাম' },
    { role: 'Village Admin', access: 'শুধুমাত্র গ্রামের ডেটা', scope: 'গ্রাম' }
  ];

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-green-600" />
              <span>API রেফারেন্স ও ভূমিকা ভিত্তিক অ্যাক্সেস</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="roles" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="roles">ভূমিকা অ্যাক্সেস</TabsTrigger>
                <TabsTrigger value="api">API এন্ডপয়েন্ট</TabsTrigger>
                <TabsTrigger value="hooks">Hooks</TabsTrigger>
                <TabsTrigger value="utils">Utilities</TabsTrigger>
              </TabsList>

              <TabsContent value="roles">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <Card className="p-4 bg-green-50 border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        ভূমিকা ভিত্তিক অ্যাক্সেস সারণী
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">ভূমিকা</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">অ্যাক্সেস</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">পরিসর</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roleAccessData.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">
                                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                    {item.role}
                                  </Badge>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{item.access}</td>
                                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                  {item.scope}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        লোকাল JSON লোড (খরচ সাশ্রয়ী)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">এই পদ্ধতি ব্যবহার করুন:</p>
                        <ul className="ml-4 space-y-1 text-gray-600">
                          <li>• Firestore reads কমানোর জন্য</li>
                          <li>• Dropdown দ্রুত populate করার জন্য</li>
                          <li>• Entry validation করার জন্য</li>
                        </ul>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">অ্যাক্সেস স্তর বিবরণ</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-l-4 border-red-500 pl-3">
                          <strong>Super Admin:</strong> সব কিছুতে অ্যাক্সেস
                        </div>
                        <div className="border-l-4 border-orange-500 pl-3">
                          <strong>Division Admin:</strong> সেই বিভাগের অধীনে সকল জেলা/উপজেলা/ইউনিয়ন
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-3">
                          <strong>District Admin:</strong> সেই জেলার অধীনে সকল উপজেলা/ইউনিয়ন
                        </div>
                        <div className="border-l-4 border-green-500 pl-3">
                          <strong>Upazila Admin:</strong> সেই উপজেলার অধীনে সকল ইউনিয়ন
                        </div>
                        <div className="border-l-4 border-blue-500 pl-3">
                          <strong>Union Admin:</strong> সেই ইউনিয়নের সকল ভোটার
                        </div>
                        <div className="border-l-4 border-purple-500 pl-3">
                          <strong>Village Admin:</strong> শুধুমাত্র সেই গ্রামের ভোটার
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="api">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Authentication API</h4>
                      <div className="space-y-2">
                        <Badge variant="outline">Firebase Auth</Badge>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Login
signInWithEmailAndPassword(auth, email, password)

// Register
createUserWithEmailAndPassword(auth, email, password)

// Logout
signOut(auth)`}
                        </pre>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Voter Management API</h4>
                      <div className="space-y-2">
                        <Badge variant="outline">Firestore</Badge>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Get Voters
const votersQuery = query(
  collection(db, 'voters'),
  where('division_id', '==', divisionId),
  orderBy('Last Updated', 'desc')
);

// Add Voter
await addDoc(collection(db, 'voters'), voterData);

// Update Voter
await updateDoc(doc(db, 'voters', voterId), updates);`}
                        </pre>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Location Data API</h4>
                      <div className="space-y-2">
                        <Badge variant="outline">JSON Files</Badge>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Load Location Data
const divisions = await fetch('/data/divisions.json');
const districts = await fetch('/data/districts.json');
const upazilas = await fetch('/data/upazilas.json');
const unions = await fetch('/data/unions.json');`}
                        </pre>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="hooks">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">useAuth Hook</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { 
  currentUser,     // Current Firebase user
  userProfile,     // User profile with role
  loading,         // Loading state
  login,           // Login function
  logout,          // Logout function
  register         // Register function
} = useAuth();`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">useLocationFilter Hook</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const {
  locationData,      // All location data
  selectedLocation,  // Current filter
  setSelectedLocation, // Update filter
  filterVoters,     // Filter voters function
  canAccessData,    // Access check function
  isLoading,        // Loading state
  userProfile       // Current user profile
} = useLocationFilter();`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="utils">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">RBAC Utilities</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Check location access
canAccessLocation(user, targetLocation)

// Get role permissions
getRolePermissions(userRole)

// Filter accessible voters
getAccessibleVoters(user, allVoters)

// Check if user can manage another user
canManageUser(managerUser, targetUser)`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Location Utilities</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Load location data from JSON
loadLocationData(type: 'divisions' | 'districts' | 'upazilas' | 'unions')

// Get location hierarchy
getLocationHierarchy(locationId, type)

// Validate location access
validateLocationAccess(user, location)`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DocumentationLayout>
  );
};

export default APIReference;
