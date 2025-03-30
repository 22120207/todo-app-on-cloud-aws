import { createLogger, format, transports } from "winston";
import { join } from "path";

// Tạo logger với định dạng JSON và timestamp
const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // Log ra console
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()), // Log ra console với định dạng đơn giản
    }),
    // Ghi log ra file
    new transports.File({
      filename: join(__dirname, "logs", "app.log"), // Ghi log vào file app.log trong thư mục logs
      level: "info", // Chỉ ghi các log có mức độ từ info trở lên
      maxsize: 5 * 1024 * 1024, // Giới hạn kích thước file log tối đa là 5MB
      maxFiles: 3, // Giới hạn số lượng file log tối đa là 3
      tailable: true, // Giữ lại các file log cũ theo thứ tự và xóa các file cũ nhất khi vượt quá giới hạn
    }),
  ],
});

// Hàm ghi log mẫu
// logger.info({ message: 'Test JSON log', level: 'info' }, (err) => {
//   if (err) {
//     console.error('Error writing log to file:', err);
//   } else {
//     console.log('Log written successfully to file');
//   }
// });

export default logger;
