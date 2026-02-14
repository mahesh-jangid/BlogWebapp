import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload image to Firebase Storage
 * @param file - Image file to upload
 * @param folder - Folder path in storage (e.g., 'blogs', 'profiles')
 * @returns Promise<string> - Download URL of uploaded image
 */
export const uploadImageToFirebase = async (
  file: File,
  folder: string = 'blogs'
): Promise<string> => {
  try {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');
    }

    // Create unique filename
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}-${file.name}`;
    
    // Create storage reference
    const fileRef = ref(storage, `${folder}/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(fileRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Delete image from Firebase Storage
 * @param imageUrl - Download URL of the image to delete
 */
export const deleteImageFromFirebase = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;

    // Extract file path from URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathStart = decodedUrl.indexOf('/o/') + 3;
    const pathEnd = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(pathStart, pathEnd);

    // Delete file
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.error('Error deleting image:', error);
    // Don't throw error, just log it
  }
};

/**
 * Get file size in MB
 * @param file - File object
 * @returns File size in MB
 */
export const getFileSizeInMB = (file: File): number => {
  return file.size / (1024 * 1024);
};
