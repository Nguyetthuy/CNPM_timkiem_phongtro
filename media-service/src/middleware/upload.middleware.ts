import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter để chỉ cho phép upload ảnh
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
    files: 10 // Tối đa 10 file
  }
});

// Middleware để validate multipart request
const validateMultipartRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 Validating multipart request...');
  console.log('📋 Request headers:', req.headers);
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📋 Content-Length:', req.headers['content-length']);
  console.log('📋 Transfer-Encoding:', req.headers['transfer-encoding']);
  
  const contentType = req.headers['content-type'];
  
  if (!contentType) {
    console.error('❌ Missing Content-Type header');
    return res.status(400).json({ error: 'Content-Type header is required' });
  }
  
  if (!contentType.includes('multipart/form-data')) {
    console.error('❌ Invalid Content-Type:', contentType);
    return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
  }
  
  if (!contentType.includes('boundary=')) {
    console.error('❌ Missing multipart boundary');
    return res.status(400).json({ error: 'Multipart boundary is required' });
  }
  
  // Kiểm tra content-length chỉ khi không có transfer-encoding
  const transferEncoding = req.headers['transfer-encoding'];
  if (!transferEncoding) {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength === 0) {
      console.error('❌ Empty request body (no transfer-encoding)');
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }
  }
  
  console.log('✅ Multipart request validation passed');
  next();
};

// Middleware xử lý lỗi upload
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Upload error:', err);
  console.error('❌ Error stack:', err.stack);
  
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error code:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File quá lớn. Tối đa 5MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Quá nhiều file. Tối đa 10 file' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
  }
  
  if (err.message.includes('Chỉ cho phép upload file ảnh')) {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message.includes('Boundary not found') || err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ 
      error: 'Invalid multipart request. Please check Content-Type header.',
      details: 'Request must include proper multipart boundary and valid form data'
    });
  }
  
  // Log thêm thông tin về request
  console.error('❌ Request info:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  next(err);
};

export { validateMultipartRequest };
export default upload; 