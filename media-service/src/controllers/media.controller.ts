import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import fs from 'fs';
import path from 'path';

export class MediaController {
  private mediaService = new MediaService();

  // Upload ảnh
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Không có file nào được upload' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedImages = [];

      for (const file of files) {
        const imageInfo = await this.mediaService.uploadImage(file);
        uploadedImages.push(imageInfo);
      }

      res.status(200).json({
        message: 'Upload ảnh thành công',
        images: uploadedImages
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy ảnh
  async getImage(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const imagePath = path.join('uploads/images', filename);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Không tìm thấy ảnh' });
      }

      res.sendFile(path.resolve(imagePath));
    } catch (error: any) {
      console.error('Get image error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy thông tin ảnh
  async getImageInfo(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const imageInfo = await this.mediaService.getImageInfo(filename);

      if (!imageInfo) {
        return res.status(404).json({ error: 'Không tìm thấy ảnh' });
      }

      res.json(imageInfo);
    } catch (error: any) {
      console.error('Get image info error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Xóa ảnh
  async deleteImage(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const success = await this.mediaService.deleteImage(filename);

      if (!success) {
        return res.status(404).json({ error: 'Không tìm thấy ảnh để xóa' });
      }

      res.json({ message: 'Xóa ảnh thành công' });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy danh sách ảnh
  async listImages(req: Request, res: Response) {
    try {
      const images = await this.mediaService.listImages();
      res.json({
        message: 'Lấy danh sách ảnh thành công',
        images
      });
    } catch (error: any) {
      console.error('List images error:', error);
      res.status(500).json({ error: error.message });
    }
  }
} 