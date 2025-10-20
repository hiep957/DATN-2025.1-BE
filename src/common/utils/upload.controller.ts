import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { configCloudinary } from './cloudinary.config';
import { createImageStorage } from './cloudinary.storage';

const cloudinary = configCloudinary();
const storage = createImageStorage('nestjs_uploads'); // đổi tên folder nếu muốn

@Controller('upload')
export class UploadController {
  // --- API: 1 ảnh ---
  // form-data key: file
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadOne(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không nhận được file');
    // multer-storage-cloudinary gắn các field đường dẫn:
    // file.path  -> URL CDN
    // file.filename -> public_id
    // file.mimetype, file.size ...
    return {
      url: (file as any).path,
      public_id: file.filename,
      format: (file as any).format,
      bytes: file.size,
      width: (file as any).width,
      height: (file as any).height,
    };
  }

  // --- API: nhiều ảnh ---
  // form-data key: files (gửi lặp nhiều lần)
  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, { storage, limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadMany(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('Không nhận được file');
    return files.map((f) => ({
      url: (f as any).path,
      public_id: f.filename,
      format: (f as any).format,
      bytes: f.size,
      width: (f as any).width,
      height: (f as any).height,
    }));
  }
}
