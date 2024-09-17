require('dotenv').config(); // Đọc các biến môi trường từ tệp .env
const crypto = require('crypto');


// Khóa bí mật từ biến môi trường
// Chuỗi hex phải chỉ chứa các ký tự từ 0-9 và a-f (hoặc A-F). 
const secretKeyRessetPassword = crypto.randomBytes(32); 

// Hàm mã hóa
const encrypt = (text,secretKey) => {
    const iv = crypto.randomBytes(16); // Tạo IV ngẫu nhiên
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
  
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

// Hàm giải mã
const decrypt = (encryptedData, secretKey ,iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

// Export các hàm để sử dụng ở những nơi khác
module.exports = {
    encrypt,
    decrypt,
    secretKeyRessetPassword
};
