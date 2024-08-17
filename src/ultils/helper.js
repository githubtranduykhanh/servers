class Number {
    static RandomNumber(min,max,count) {
        // Tạo mảng để lưu trữ số ngẫu nhiên
        const numbers = [];
         // Kiểm tra đầu vào
        if (min > max) {
            return numbers
        }
        if (count <= 0) {
            return numbers
        }

        for (let i = 0; i < count; i++) {
            numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return numbers;
    }
}

module.exports = {
    Number
}