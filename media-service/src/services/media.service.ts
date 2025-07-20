import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Request } from 'express';

export interface ImageInfo {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
  url: string;
}

export class MediaService {
  private uploadDir = 'uploads/images/';
  private baseUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3000/media';

  // Upload và xử lý ảnh
  async uploadImage(file: any): Promise<ImageInfo> {
    try {
      const imagePath = path.join(this.uploadDir, file.filename);
      
      // Tạo thumbnail (tùy chọn)
      await this.createThumbnail(imagePath);
      
      const imageInfo: ImageInfo = {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: imagePath,
        url: `${this.baseUrl}/images/${file.filename}`
      };
      
      return imageInfo;
    } catch (error) {
      throw new Error(`Lỗi upload ảnh: ${error}`);
    }
  }

  // Tạo thumbnail
  private async createThumbnail(imagePath: string): Promise<void> {
    try {
      const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
      
      await sharp(imagePath)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    } catch (error) {
      console.error('Lỗi tạo thumbnail:', error);
      // Không throw error vì thumbnail không bắt buộc
    }
  }

  // Lấy thông tin ảnh
  async getImageInfo(filename: string): Promise<ImageInfo | null> {
    try {
      const imagePath = path.join(this.uploadDir, filename);
      
      if (!fs.existsSync(imagePath)) {
        return null;
      }
      
      const stats = fs.statSync(imagePath);
      const ext = path.extname(filename);
      const mimetype = this.getMimeType(ext);
      
      return {
        filename,
        originalName: filename,
        size: stats.size,
        mimetype,
        path: imagePath,
        url: `${this.baseUrl}/images/${filename}`
      };
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin ảnh: ${error}`);
    }
  }

  // Xóa ảnh
  async deleteImage(filename: string): Promise<boolean> {
    try {
      const imagePath = path.join(this.uploadDir, filename);
      const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
      
      // Xóa ảnh gốc
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Xóa thumbnail nếu có
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi xóa ảnh: ${error}`);
    }
  }

  // Lấy danh sách ảnh
  async listImages(): Promise<ImageInfo[]> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const images: ImageInfo[] = [];
      
      for (const file of files) {
        if (file.includes('_thumb')) continue; // Bỏ qua thumbnail
        
        const imageInfo = await this.getImageInfo(file);
        if (imageInfo) {
          images.push(imageInfo);
        }
      }
      
      return images;
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách ảnh: ${error}`);
    }
  }

  // Lấy MIME type từ extension
  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}
