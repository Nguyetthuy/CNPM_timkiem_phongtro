import { Request, Response } from 'express';
export declare class MediaController {
    private mediaService;
    uploadImage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getImage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getImageInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteImage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    listImages(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=media.controller.d.ts.map