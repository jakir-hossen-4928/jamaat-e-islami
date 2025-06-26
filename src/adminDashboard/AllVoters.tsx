
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
import { Edit, Trash2, Search, Eye } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const AllVoters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoter, setSelectedVoter] = useState<VoterData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    voter.ID?.includes(searchTerm)
  );

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">সকল ভোটার</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="নাম, ফোন বা ID দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ভোটার তালিকা ({filteredVoters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">লোড হচ্ছে...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>নাম</TableHead>
                      <TableHead>ফোন</TableHead>
                      <TableHead>বয়স</TableHead>
                      <TableHead>ভোট দেবেন</TableHead>
                      <TableHead>অগ্রাধিকার</TableHead>
                      <TableHead>কার্যক্রম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoters.map((voter) => (
                      <TableRow key={voter.id}>
                        <TableCell className="font-medium">{voter.ID}</TableCell>
                        <TableCell>{voter['Voter Name']}</TableCell>
                        <TableCell>{voter.Phone}</TableCell>
                        <TableCell>{voter.Age}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            voter['Will Vote'] === 'Yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {voter['Will Vote'] === 'Yes' ? 'হ্যাঁ' : 'না'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            voter['Priority Level'] === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : voter['Priority Level'] === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {voter['Priority Level'] === 'High' ? 'উচ্চ' : 
                             voter['Priority Level'] === 'Medium' ? 'মাঝারি' : 'নিম্ন'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(voter)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(voter)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(voter.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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
            className="w-full p-2 border rounded-md"
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
            className="w-full p-2 border rounded-md"
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
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.Remarks || ''}
          onChange={(e) => setFormData({...formData, Remarks: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </Button>
      </div>
    </form>
  );
};

export default AllVoters;
