# Đồ Án Xử Lý Ảnh Số: Phát Hiện Biên Bằng Đạo Hàm Bậc Nhất (First-Order Edge Detection)

Ứng dụng web trực quan hóa và mô phỏng thực nghiệm các toán tử phát hiện biên đạo hàm bậc nhất tiêu biểu trong Xử lý ảnh số: **Sobel**, **Prewitt**, **Roberts Cross** và **Scharr**.

---

## 🌟 Tính Năng Nổi Bật

1. **Phòng Thí Nghiệm Biên Tương Tác (Interactive Edge Lab)**:
   - Thử nghiệm 4 toán tử đạo hàm bậc 1: Sobel ($3\times 3$), Prewitt ($3\times 3$), Roberts Cross ($2\times 2$), Scharr ($3\times 3$).
   - 5 chế độ hiển thị: Ảnh nhị phân (Binary Edge Map), Độ lớn Gradient $|G|$, Cạnh dọc $G_x$, Cạnh ngang $G_y$, Bản đồ góc hướng $\theta$.
   - Điều khiển ngưỡng tách biên thủ công ($0 - 255$) và thuật toán tìm ngưỡng tự động **Otsu (Otsu Thresholding)**.
   - Thanh trượt vuốt so sánh Trước / Sau (**Split Comparison Slider**) trực tiếp trên khung hình.
   - Bộ lọc làm mờ Gauss (**Gaussian Blur**) khử nhiễu trước khi tính vi phân.

2. **Chụp Ảnh Trực Tiếp Bằng Camera / Webcam**:
   - Cho phép mở webcam máy tính/điện thoại chụp khuôn mặt hoặc vật thể thực tế để kiểm thử biên tức thì.
   - Tích hợp cơ chế fallback mở ứng dụng camera thiết bị.

3. **Kính Hiển Vi Ma Trận Toán Học (Step-by-Step Math Inspector)**:
   - Nhấp chuột vào bất kỳ pixel nào trên ảnh để xem ma trận lân cận $3\times 3$ hoặc $2\times 2$.
   - Chi tiết từng bước tích chập con:
     $$G_x = \sum I(x, y) \cdot K_x, \quad G_y = \sum I(x, y) \cdot K_y$$
     $$|G| = \sqrt{G_x^2 + G_y^2}$$
   - So sánh $|G| \ge T \implies$ Kết luận pixel thuộc **Biên (255)** hay **Nền (0)**.

4. **Thực Nghiệm So Sánh Song Song 4 Toán Tử (Benchmark)**:
   - Chạy đồng thời cả 4 thuật toán trên cùng 1 ảnh để đối chiếu thời gian xử lý (ms), số điểm biên (%) và độ mịn đường viền.

5. **Bộ Ảnh Mẫu Chuẩn Quốc Tế & Lý Thuyết Đồ Án**:
   - Tích hợp các ảnh kiểm thử kinh điển: *Cameraman*, *Chân dung nghệ thuật*, *Xe ô tô & Biển số*, *Đồng xu*, *Mẫu thử nhiễu hạt*.
   - Đầy đủ lý thuyết giải tích vector Gradient và mã nguồn mẫu bằng **Python (OpenCV + Numpy)**.

---

## 📐 Bảng So Sánh 4 Toán Tử Đạo Hàm Bậc Nhất

| Toán tử | Kích thước | Ma trận Kernel $K_x$ | Khả năng chống nhiễu | Đặc điểm nổi bật |
| :--- | :---: | :---: | :---: | :--- |
| **Sobel** | $3\times 3$ | `[[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]` | Rất tốt | Làm trơn Gauss $[1, 2, 1]$, chuẩn mực thực tế |
| **Prewitt** | $3\times 3$ | `[[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]` | Khá | Trọng số đều $[1, 1, 1]$, tính toán nhanh |
| **Roberts Cross** | $2\times 2$ | `[[1, 0], [0, -1]]` | Kém (Nhạy nhiễu) | Sai phân chéo, viền mảnh (1 px), rất nhanh |
| **Scharr** | $3\times 3$ | `[[-3, 0, 3], [-10, 0, 10], [-3, 0, 3]]` | Rất tốt | Tối ưu hóa đối xứng quay khi góc nghiêng tự do |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trên Máy Tính

### Yêu cầu tiên quyết
- Cài đặt **Node.js** (khuyến nghị phiên bản LTS 18 hoặc 20 trở lên): [https://nodejs.org](https://nodejs.org)

### Các bước thực hiện

1. **Clone hoặc tải mã nguồn về máy**:
   ```bash
   git clone https://github.com/your-username/first-order-edge-detection.git
   cd first-order-edge-detection
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development Server)**:
   ```bash
   npm run dev
   ```

4. **Truy cập ứng dụng**:
   Mở trình duyệt và truy cập vào địa chỉ:
   ```text
   http://localhost:3000
   ```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Frosted Glassmorphism, Liquid Aurora Gradient
- **Icons & Motion**: Lucide React, Motion
- **Build Tool**: Vite
- **Image Processing Engine**: Pure TypeScript Computer Vision (HTML5 Canvas & TypedArrays)

---

## 📄 Bản Quyền & Giấy Phép
Được phát triển phục vụ mục đích học tập và nghiên cứu môn **Xử Lý Ảnh Số (Digital Image Processing)**. Giấy phép mã nguồn mở Apache-2.0.
