# Facility Image Upload Guide

This guide explains how to properly upload unique images for each facility using the new Supabase Storage integration.

## Why This Approach is Better

Instead of relying on a limited set of Unsplash URLs, the new system allows you to:

1. Upload real, unique images for each facility
2. Store images reliably in Supabase Storage
3. Have complete control over your image assets
4. Avoid duplicate images across facilities

## How to Upload Images

### 1. Through the Admin Interface (Recommended)

1. Log in to the admin panel
2. Navigate to Facilities
3. Click "Edit" on any facility
4. In the Images section, click "Add Image"
5. Select images from your device
6. Watch the upload progress
7. Reorder images using drag-and-drop
8. Click "Save Changes"

### 2. Programmatically (For Developers)

You can use the `useFacilityImageUpload` hook in your React components:

```typescript
import { useFacilityImageUpload } from "@/hooks/features/facilities/useFacilityImageUpload";

const MyComponent = () => {
  const { uploadImages, isUploading, uploadProgress, error } = useFacilityImageUpload();
  
  const handleImageUpload = async (files: File[], facilityId: string) => {
    const urls = await uploadImages(files, facilityId);
    // Handle the uploaded image URLs
    console.log('Uploaded images:', urls);
  };
  
  return (
    // Your component JSX
    <div>
      {isUploading && <p>Uploading... {uploadProgress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};
```

## Best Practices for Facility Images

### 1. Image Selection by Facility Type

- **Sports Halls**: Action shots, equipment, courts, locker rooms
- **Meeting Rooms**: Professional spaces, conference tables, technology
- **Football Fields**: Aerial views, goal posts, playing surfaces
- **Swimming Halls**: Pool areas, diving boards, changing facilities
- **Tennis Courts**: Court surfaces, nets, surrounding areas

### 2. Image Quality Guidelines

- Use high-resolution images (minimum 800x600 pixels)
- Ensure good lighting and clarity
- Show the actual facility spaces
- Include multiple angles (wide shots and details)
- Avoid watermarks or logos

### 3. Image Quantity

Each facility should have 4-6 images:
1. Main hero image (wide shot)
2. Interior/detail shots (2-3 images)
3. Amenities/extra features (1-2 images)

## Storage Structure

Images are stored in Supabase Storage with the following structure:
```
facility-images/
├── {facility-id}/
│   ├── {timestamp}-{random-string}.{extension}
│   ├── {timestamp}-{random-string}.{extension}
│   └── ...
└── ...
```

## Benefits of This Approach

1. **Truly Unique Images**: Each facility can have completely unique images
2. **Reliability**: No dependency on external image services
3. **Performance**: Images served from the same CDN as your Supabase project
4. **Scalability**: Supabase Storage automatically scales with your needs
5. **Control**: Full control over your image assets

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size (max 10MB) and type (JPEG, PNG, GIF, WebP)
2. **Images Don't Display**: Verify the `facility-images` bucket exists and is public
3. **Slow Uploads**: Check network connection and file sizes

### Error Messages

- "Invalid file type": Only JPEG, PNG, GIF, and WebP are allowed
- "File size exceeds 10MB limit": Compress images or use smaller files
- "Upload failed": Check network connection and Supabase configuration

## Next Steps

1. Create the `facility-images` storage bucket in your Supabase project
2. Set up proper storage policies (public read, authenticated write)
3. Use the admin interface to upload unique images for each facility
4. Test that images display correctly in the facility detail pages

This approach will ensure that each of your 8 facilities has truly unique, relevant images that accurately represent the space.