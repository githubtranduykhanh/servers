const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params:{
    folder:'event-hub'
  }
});

// Cấu hình Multer Storage cho người dùng
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'event-hub/users', // Thư mục lưu trữ hình ảnh người dùng
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(), // Tên tệp duy nhất
  },
});

// Cấu hình Multer Storage cho sản phẩm
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'event-hub/products', // Thư mục lưu trữ hình ảnh sản phẩm
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(), // Tên tệp duy nhất
  },
});

const uploadCloud = multer({ storage });
const uploadProduct = multer({ storage: productStorage });
const uploadUser = multer({ storage: userStorage });

module.exports = {
  uploadCloud,
  uploadProduct,
  uploadUser
}
