import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const usePhotoUpload = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = useCallback(async (file: File | Blob, filename?: string): Promise<string | null> => {
    if (!user) return null;
    
    setUploading(true);
    try {
      const fileExt = filename?.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [user, toast]);

  const updateProfilePhotos = useCallback(async (photos: string[]) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ photos })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Error updating photos:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photos.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, refreshProfile, toast]);

  const setMainPhoto = useCallback(async (index: number) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ main_photo_index: index })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast({
        title: "Main photo updated",
        description: "Your main profile photo has been changed.",
      });
      return true;
    } catch (error) {
      console.error('Error setting main photo:', error);
      return false;
    }
  }, [user, refreshProfile, toast]);

  const deletePhoto = useCallback(async (photoUrl: string, currentPhotos: string[]) => {
    if (!user) return false;
    
    try {
      // Remove from storage if it's our URL
      if (photoUrl.includes('chat-media')) {
        const path = photoUrl.split('chat-media/')[1];
        if (path) {
          await supabase.storage.from('chat-media').remove([path]);
        }
      }
      
      // Update profile
      const updatedPhotos = currentPhotos.filter(p => p !== photoUrl);
      return await updateProfilePhotos(updatedPhotos);
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }, [user, updateProfilePhotos]);

  return {
    uploading,
    uploadPhoto,
    updateProfilePhotos,
    setMainPhoto,
    deletePhoto,
    photos: profile?.photos || []
  };
};
