import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Options } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

export function createImageStorage(folder = 'nestjs_uploads') {
  // Lưu ý: allowed_formats kiểm tra cả đuôi & mimetype trên Cloudinary
  const params: Options['params'] =
    async (_req, file) => ({
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      // Tạo public_id "gọn gàng": không dấu cách/ký tự lạ
      public_id: file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^\w\-]+/g, '_')
        .toLowerCase() + '_' + Date.now(),
      // Tự động nén/chuẩn hóa: (không bắt buộc)
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

  return new CloudinaryStorage({ cloudinary, params });
}
