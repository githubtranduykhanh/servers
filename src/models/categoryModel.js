/** @format */
/** @format */

const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // Đảm bảo mỗi category có một key duy nhất
    },
    title: {
      type: String,
      required: true,
    },
    iconLibrary: {
      type: String,
      required: true, // Ví dụ: 'Ionicons', 'FontAwesome', 'CustomSVG'
    },
    iconName: {
      type: String,
      required: true, // Tên icon, ví dụ: 'basketball', 'music', 'ChefForkSVG'
    },
    iconSize: {
      type: Number,
      default: 22, // Kích thước mặc định của icon
    },
    iconColor: {
      type: String,
      required: true, // Mã màu cho icon, ví dụ: '#EE544A'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("categories", CategorySchema);
