import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Search, Eye, Settings, Plus } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdvancedPDFGenerator from '@/components/AdvancedPDFGenerator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const AllVoters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoter, setSelectedVoter] = useState<VoterData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const allColumns = [
    'Voter Name', 'House Name', 'FatherOrHusband', 'Age', 'Gender', 'Marital Status',
    'Student', 'Occupation', 'Education', 'Religion', 'Phone', 'WhatsApp', 'NID',
    'Is Voter', 'Will Vote', 'Voted Before', 'Vote Probability (%)', 'Political Support',
    'Priority Level', 'Has Disability', 'Is Migrated', 'Remarks', 'Collector', 'Collection Date'
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    'Voter Name': true,
    'Age': true,
    'Phone': true,
    'Will Vote': true,
    'Priority Level': true,
    'Vote Probability (%)': true,
    'House Name': false,
    'FatherOrHusband': false,
    'Gender': false,
    'Marital Status': false,
    'Student': false,
    'Occupation': false,
    'Education': false,
    'Religion': false,
    'WhatsApp': false,
    'NID': false,
    'Is Voter': false,
    'Voted Before': false,
    'Political Support': false,
    'Has Disability': false,
    'Is Migrated': false,
    'Remarks': false,
    'Collector': false,
    'Collection Date': false
  });

  const { data: voters = [], isLoading } = useQuery({
    queryKey: ['voters'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    }
  });

  const deleteVoterMutation = useMutation({
    mutationFn: async (voterId: string) => {
      await deleteDoc(doc(db, 'voters', voterId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: "সফল",
        description: "ভোটার তথ্য মুছে ফেলা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ভোটার তথ্য মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const updateVoterMutation = useMutation({
    mutationFn: async (voter: VoterData) => {
      const { id, ...voterData } = voter;
      if (!id) return;
      await updateDoc(doc(db, 'voters', id), {
        ...voterData,
        'Last Updated': new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      setEditDialogOpen(false);
      toast({
        title: "সফল",
        description: "ভোটার তথ্য আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ভোটার তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const filteredVoters = voters.filter(voter =>
    voter['Voter Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.Phone?.includes(searchTerm) ||
    voter.ID?.includes(searchTerm) ||
    voter.NID?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredVoters.length / pageSize);
  const paginatedVoters = filteredVoters.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats calculation
  const stats = {
    totalVoters: voters.length,
    willVoteCount: voters.filter(v => v['Will Vote'] === 'Yes').length,
    highPriorityCount: voters.filter(v => v['Priority Level'] === 'High').length,
    studentCount: voters.filter(v => v.Student === 'Yes').length,
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleEdit = (voter: VoterData) => {
    setSelectedVoter(voter);
    setEditDialogOpen(true);
  };

  const handleView = (voter: VoterData) => {
    setSelectedVoter(voter);
    setViewDialogOpen(true);
  };

  const handleDelete = (voterId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ভোটার তথ্য মুছে ফেলতে চান?')) {
      deleteVoterMutation.mutate(voterId);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getFieldValue = (voter: VoterData, field: string) => {
    return voter[field as keyof VoterData] || '-';
  };

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'moderator';
  const canDelete = userProfile?.role === 'admin';

  return (
    <AdminLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="shadow-lg border-l-4 border-l-green-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">মোট ভোটার</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.totalVoters}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">উচ্চ অগ্রাধিকার</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.highPriorityCount}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">ভোট দেবেন</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.willVoteCount}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">ছাত্র</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.studentCount}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <span>ভোটার ব্যবস্থাপনা</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                পৃষ্ঠা {currentPage} এর {totalPages} • মোট {stats.totalVoters}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <Input
                  placeholder="নাম, ফোন বা NID দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <AdvancedPDFGenerator />

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                      <Settings className="w-3 h-3" />
                      কলাম
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>টেবিল কলাম সেটিংস</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {allColumns.map((column) => (
                        <div key={column} className="flex items-center space-x-2">
                          <Checkbox
                            id={column}
                            checked={visibleColumns[column]}
                            onCheckedChange={() => handleColumnToggle(column)}
                          />
                          <Label htmlFor={column} className="text-sm cursor-pointer">
                            {column}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voters Table */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    {allColumns.filter(col => visibleColumns[col]).map((column) => (
                      <TableHead key={column} className="text-xs sm:text-sm whitespace-nowrap font-semibold">
                        {column}
                      </TableHead>
                    ))}
                    <TableHead className="text-xs sm:text-sm font-semibold">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-8 text-sm text-gray-500">
                        লোড হচ্ছে...
                      </TableCell>
                    </TableRow>
                  ) : paginatedVoters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-8 text-sm text-gray-500">
                        {searchTerm ? `"${searchTerm}" খুঁজে পাওয়া যায়নি` : 'কোন ভোটার পাওয়া যায়নি'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVoters.map((voter) => (
                      <TableRow key={voter.id} className="hover:bg-gray-50 transition-colors">
                        {allColumns.filter(col => visibleColumns[col]).map((column) => (
                          <TableCell key={column} className="text-xs sm:text-sm">
                            {column === 'Priority Level' ? (
                              <Badge variant={
                                getFieldValue(voter, column) === 'High' ? 'destructive' :
                                  getFieldValue(voter, column) === 'Medium' ? 'default' : 'secondary'
                              } className="text-xs shadow-sm">
                                {getFieldValue(voter, column) === 'High' ? 'উচ্চ' : 
                                 getFieldValue(voter, column) === 'Medium' ? 'মাঝারি' : 'নিম্ন'}
                              </Badge>
                            ) : column === 'Vote Probability (%)' ? (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{getFieldValue(voter, column) || 0}%</span>
                                {(() => {
                                  const value = getFieldValue(voter, column);
                                  const numValue = typeof value === 'string' ? parseInt(value) : value;
                                  return (numValue && numValue >= 80) && (
                                    <Badge variant="default" className="bg-green-600 text-xs">উচ্চ</Badge>
                                  );
                                })()}
                              </div>
                            ) : column === 'Will Vote' || column === 'Is Voter' || column === 'Student' || column === 'WhatsApp' || column === 'Has Disability' || column === 'Is Migrated' || column === 'Voted Before' ? (
                              <span className={getFieldValue(voter, column) === 'Yes' ? 'text-green-600 font-medium' : 'text-red-500'}>
                                {getFieldValue(voter, column) === 'Yes' ? '✓ হ্যাঁ' : getFieldValue(voter, column) === 'No' ? '✗ না' : '-'}
                              </span>
                            ) : (
                              <span className={column === 'Voter Name' ? 'font-medium text-gray-900' : ''}>
                                {getFieldValue(voter, column)}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(voter)}
                              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(voter)}
                                className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 h-7 w-7 p-0 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleDelete(voter.id!)}
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{
                      pointerEvents: currentPage === 1 ? 'none' : 'auto',
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                    className="hover:bg-green-50 hover:text-green-700"
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={pageNum === currentPage}
                        className={pageNum === currentPage ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-700'}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{
                      pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                    className="hover:bg-green-50 hover:text-green-700"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ভোটার বিস্তারিত তথ্য</DialogTitle>
            </DialogHeader>
            {selectedVoter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="font-semibold">{selectedVoter.ID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">নাম</label>
                  <p className="font-semibold">{selectedVoter['Voter Name']}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">বাড়ির নাম</label>
                  <p className="font-semibold">{selectedVoter['House Name'] || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">পিতা/স্বামী</label>
                  <p className="font-semibold">{selectedVoter.FatherOrHusband || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">বয়স</label>
                  <p className="font-semibold">{selectedVoter.Age}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">লিঙ্গ</label>
                  <p className="font-semibold">{selectedVoter.Gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ফোন</label>
                  <p className="font-semibold">{selectedVoter.Phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">NID</label>
                  <p className="font-semibold">{selectedVoter.NID}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ভোটার তথ্য সম্পাদনা</DialogTitle>
            </DialogHeader>
            {selectedVoter && (
              <VoterEditForm 
                voter={selectedVoter} 
                onSave={(voter) => updateVoterMutation.mutate(voter)}
                isLoading={updateVoterMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

const VoterEditForm = ({ 
  voter, 
  onSave, 
  isLoading 
}: { 
  voter: VoterData; 
  onSave: (voter: VoterData) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState(voter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">নাম *</label>
          <Input
            value={formData['Voter Name']}
            onChange={(e) => setFormData({...formData, 'Voter Name': e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ফোন</label>
          <Input
            value={formData.Phone || ''}
            onChange={(e) => setFormData({...formData, Phone: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">বয়স</label>
          <Input
            type="number"
            value={formData.Age || ''}
            onChange={(e) => setFormData({...formData, Age: parseInt(e.target.value) || undefined})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ভোট দেবেন</label>
          <select
            className="w-full p-2 border rounded-md hover:border-green-300 focus:border-green-500"
            value={formData['Will Vote'] || ''}
            onChange={(e) => setFormData({...formData, 'Will Vote': e.target.value as 'Yes' | 'No'})}
          >
            <option value="">নির্বাচন করুন</option>
            <option value="Yes">হ্যাঁ</option>
            <option value="No">না</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">অগ্রাধিকার</label>
          <select
            className="w-full p-2 border rounded-md hover:border-green-300 focus:border-green-500"
            value={formData['Priority Level'] || ''}
            onChange={(e) => setFormData({...formData, 'Priority Level': e.target.value as 'Low' | 'Medium' | 'High'})}
          >
            <option value="">নির্বাচন করুন</option>
            <option value="Low">নিম্ন</option>
            <option value="Medium">মাঝারি</option>
            <option value="High">উচ্চ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ভোট সম্ভাবনা (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData['Vote Probability (%)'] || ''}
            onChange={(e) => setFormData({...formData, 'Vote Probability (%)': parseInt(e.target.value) || undefined})}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">মন্তব্য</label>
        <textarea
          className="w-full p-2 border rounded-md hover:border-green-300 focus:border-green-500"
          rows={3}
          value={formData.Remarks || ''}
          onChange={(e) => setFormData({...formData, Remarks: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </Button>
      </div>
    </form>
  );
};

export default AllVoters;
