
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Bán kính Trái đất tính bằng km
    const toRad = (value) => (value * Math.PI) / 180; // Chuyển từ độ sang radian
  
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách tính bằng km
};
  
module.exports = calculateDistance;
  