import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
declare const upload: multer.Multer;
declare const validateMultipartRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const handleUploadError: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { validateMultipartRequest };
export default upload;
//# sourceMappingURL=upload.middleware.d.ts.map