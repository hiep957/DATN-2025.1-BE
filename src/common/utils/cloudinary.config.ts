import { v2 as cloudinary } from 'cloudinary';

export function configCloudinary() {
  cloudinary.config({
    cloud_name: "dmlfolzmj",
    api_key:"938816921467175",
    api_secret:"zmTMF4dT2XRseybZEjSVY1_DKAI"  ,
  });
  return cloudinary;
}
