# Facility Image Management

This document explains how to manage facility images in the Booknor application using the new Supabase Storage integration.

## Overview

The facility image management system now supports uploading images directly to Supabase Storage instead of relying on external URLs. This provides better reliability and allows for unique images for each facility.

## Features

1. **Direct Image Upload**: Upload images directly from the admin interface
2. **Supabase Storage Integration**: Images are stored in the `facility-images` bucket
3. **Drag and Drop Reordering**: Reorder images by dragging them
4. **Progress Tracking**: See upload progress during image uploads
5. **Error Handling**: Proper error messages for failed uploads

## How It Works

### 1. Image Upload Process

1. Admin navigates to the facility edit page
2. Clicks "Add Image" button
3. Selects one or more images from their device
4. Images are uploaded to Supabase Storage
5. Public URLs are generated and stored in the facility record
6. Images appear in the image list and can be reordered

### 2. Technical Implementation

The system uses a custom hook `useFacilityImageUpload` that:

- Validates file types (JPEG, PNG, GIF, WebP)
- Enforces file size limits (10MB max)
- Generates unique file names to prevent conflicts
- Uploads files to the `facility-images` bucket
- Returns public URLs for use in the application

### 3. Storage Structure

Images are stored in the `facility-images` bucket with the following structure:
```
facility-images/
├── {facility-id}/
│   ├── {timestamp}-{random-string}.{extension}
│   ├── {timestamp}-{random-string}.{extension}
│   └── ...
└── ...
```

## Setup Instructions

### 1. Create the Storage Bucket

Run the migration script to create the `facility-images` bucket:
```bash
npx supabase migration up
```

Or manually create the bucket through the Supabase dashboard:
1. Go to Storage → Buckets
2. Click "New Bucket"
3. Name it `facility-images`
4. Set it as public

### 2. Set Up Storage Policies

The following policies should be configured for the bucket:

```sql
-- Public read access for displaying images
CREATE POLICY "Public Access for Facility Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'facility-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated Users Can Upload Facility Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'facility-images' AND auth.role() = 'authenticated');

-- Users can update their own facility images
CREATE POLICY "Users Can Update Their Facility Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'facility-images' AND auth.role() = 'authenticated');

-- Users can delete their own facility images
CREATE POLICY "Users Can Delete Their Facility Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'facility-images' AND auth.role() = 'authenticated');
```

## Usage

### For Administrators

1. Navigate to the Facilities section in the admin panel
2. Select a facility to edit
3. Scroll to the "Images" section
4. Click "Add Image" to upload new images
5. Wait for uploads to complete
6. Drag and drop images to reorder them
7. Click "Save Changes" to persist the updates

### For Developers

The image upload functionality is implemented in:
- `src/hooks/features/facilities/useFacilityImageUpload.ts` - Custom hook for uploading images
- `src/components/features/facilities/components/FacilityEditForm/FacilityEditForm.tsx` - Integration with the edit form

To use the hook in other components:
```typescript
import { useFacilityImageUpload } from "@/hooks/features/facilities/useFacilityImageUpload";

const MyComponent = () => {
  const { uploadImages, isUploading, uploadProgress, error } = useFacilityImageUpload();
  
  const handleUpload = async (files: File[], facilityId: string) => {
    const urls = await uploadImages(files, facilityId);
    // Handle the uploaded image URLs
  };
  
  return (
    // Your component JSX
  );
};
```

## Benefits

1. **Unique Images**: Each facility can have completely unique images
2. **Reliability**: No dependency on external image services
3. **Performance**: Images are served from the same CDN as your Supabase project
4. **Scalability**: Supabase Storage automatically scales with your needs
5. **Security**: Proper authentication and authorization controls

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and type restrictions
2. **Images Don't Display**: Verify the bucket is public and policies are correct
3. **Slow Uploads**: Check network connection and file sizes

### Error Messages

- "Invalid file type": Only JPEG, PNG, GIF, and WebP are allowed
- "File size exceeds 10MB limit": Compress images or use smaller files
- "Upload failed": Check network connection and Supabase configuration

## Future Improvements

1. **Image Optimization**: Automatically resize and compress images
2. **Bulk Upload**: Upload multiple facilities' images at once
3. **Image Editor**: Basic cropping and editing tools
4. **Alt Text**: Add accessibility descriptions for images