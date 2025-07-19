export interface ImageInfo {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    path: string;
    url: string;
}
export declare class MediaService {
    private uploadDir;
    uploadImage(file: Express.Multer.File): Promise<ImageInfo>;
    private createThumbnail;
    getImageInfo(filename: string): Promise<ImageInfo | null>;
    deleteImage(filename: string): Promise<boolean>;
    listImages(): Promise<ImageInfo[]>;
    private getMimeType;
}
//# sourceMappingURL=media.service.d.ts.map