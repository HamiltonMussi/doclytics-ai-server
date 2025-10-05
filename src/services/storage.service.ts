import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'doclytics',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: no result returned'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async delete(fileUrl: string): Promise<void> {
    const publicId = this.extractPublicId(fileUrl);

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  private extractPublicId(url: string): string | null {
    const matches = url.match(/\/doclytics\/([^/.]+)/);
    return matches ? `doclytics/${matches[1]}` : null;
  }
}
