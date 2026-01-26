import { supabase } from '../config/supabase';

const BUCKET_NAME = 'profile-images';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

export const storageService = {
  uploadProfileImage: async (
    userId: string,
    imageUri: string
  ): Promise<UploadResult> => {
    try {
      console.log('storageService - Uploading profile image for user:', userId);

      const fileName = `${userId}/profile-${Date.now()}.jpg`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.log('storageService - Upload error:', error.message);
        return { success: false, error: error.message };
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('storageService - Upload successful, URL:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('storageService - Exception uploading image:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  deleteProfileImage: async (userId: string): Promise<DeleteResult> => {
    try {
      console.log('storageService - Deleting profile images for user:', userId);

      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId);

      if (listError) {
        console.log('storageService - List error:', listError.message);
        return { success: false, error: listError.message };
      }

      if (!files || files.length === 0) {
        console.log('storageService - No files found to delete');
        return { success: true };
      }

      const filePaths = files.map(file => `${userId}/${file.name}`);

      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        console.log('storageService - Delete error:', deleteError.message);
        return { success: false, error: deleteError.message };
      }

      console.log('storageService - Delete successful');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('storageService - Exception deleting image:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getProfileImageUrl: (path: string): string => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },
};
