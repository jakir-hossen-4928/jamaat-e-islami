
import { useState } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface UseVoterOperationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useVoterOperations = (options: UseVoterOperationsOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addVoter = async (voterData: Omit<VoterData, 'id'>) => {
    setIsLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'voters'), {
        ...voterData,
        'Last Updated': serverTimestamp()
      });
      
      toast({
        title: 'সফল',
        description: 'নতুন ভোটার যোগ করা হয়েছে',
      });
      
      options.onSuccess?.();
      return docRef.id;
    } catch (error) {
      console.error('Error adding voter:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ভোটার যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVoter = async (voterId: string, updates: Partial<VoterData>) => {
    setIsLoading(true);
    try {
      const voterRef = doc(db, 'voters', voterId);
      await updateDoc(voterRef, {
        ...updates,
        'Last Updated': serverTimestamp()
      });
      
      toast({
        title: 'সফল',
        description: 'ভোটারের তথ্য আপডেট করা হয়েছে',
      });
      
      options.onSuccess?.();
    } catch (error) {
      console.error('Error updating voter:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ভোটারের তথ্য আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoter = async (voterId: string) => {
    setIsLoading(true);
    try {
      const voterRef = doc(db, 'voters', voterId);
      await deleteDoc(voterRef);
      
      toast({
        title: 'সফল',
        description: 'ভোটার মুছে ফেলা হয়েছে',
      });
      
      options.onSuccess?.();
    } catch (error) {
      console.error('Error deleting voter:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ভোটার মুছতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const batchUpdateVoters = async (updates: Array<{ id: string; data: Partial<VoterData> }>) => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const voterRef = doc(db, 'voters', id);
        batch.update(voterRef, {
          ...data,
          'Last Updated': serverTimestamp()
        });
      });
      
      await batch.commit();
      
      toast({
        title: 'সফল',
        description: `${updates.length}টি ভোটারের তথ্য আপডেট করা হয়েছে`,
      });
      
      options.onSuccess?.();
    } catch (error) {
      console.error('Error batch updating voters:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ব্যাচ আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addVoter,
    updateVoter,
    deleteVoter,
    batchUpdateVoters,
    isLoading
  };
};
