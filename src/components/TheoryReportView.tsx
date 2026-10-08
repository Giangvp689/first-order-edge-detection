import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  FileText,
  Lightbulb,
  Sparkles,
  Table,
} from 'lucide-react';

export function TheoryReportView() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const pythonCode = `import cv2
import numpy as np
import matplotlib.pyplot as plt

def edge_detection_first_order(image_path, threshold=50):
    # 1. Đọc ảnh và chuyển sang ảnh xám (Grayscale)
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Không tìm thấy tệp ảnh đầu vào!")

    # 2. Tiền xử lý: Lọc mờ Gauss khử nhiễu (Gaussian Blur 3x3)
    img_blur = cv2.GaussianBlur(img, (3, 3), 0)

    # ==========================================
    # A. TOÁN TỬ SOBEL (3x3 - Gauss + Sai phân)
    # ==========================================
    sobel_x = cv2.Sobel(img_blur, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(img_blur, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.sqrt(sobel_x**2 + sobel_y**2)
    sobel_bin = (sobel_mag >= threshold).astype(np.uint8) * 255

    # ==========================================
    # B. TOÁN TỬ PREWITT (3x3 - Trọng số đều)
    # ==========================================
    kernel_px = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    kernel_py = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    prewitt_x = cv2.filter2D(img_blur, cv2.CV_64F, kernel_px)
    prewitt_y = cv2.filter2D(img_blur, cv2.CV_64F, kernel_py)
    prewitt_mag = np.sqrt(prewitt_x**2 + prewitt_y**2)
    prewitt_bin = (prewitt_mag >= threshold).astype(np.uint8) * 255

    # ==========================================
    # C. TOÁN TỬ ROBERTS CROSS (2x2 - Sai phân chéo)
    # ==========================================
    kernel_rx = np.array([[1, 0], [0, -1]], dtype=np.float32)
    kernel_ry = np.array([[0, 1], [-1, 0]], dtype=np.float32)
    roberts_x = cv2.filter2D(img_blur, cv2.CV_64F, kernel_rx)
    roberts_y = cv2.filter2D(img_blur, cv2.CV_64F, kernel_ry)
    roberts_mag = np.sqrt(roberts_x**2 + roberts_y**2)
    roberts_bin = (roberts_mag >= threshold).astype(np.uint8) * 255

    # ==========================================
    # D. TOÁN TỬ SCHARR (3x3 - Tối ưu đối xứng quay)
    # ==========================================
    scharr_x = cv2.Scharr(img_blur, cv2.CV_64F, 1, 0)
    scharr_y = cv2.Scharr(img_blur, cv2.CV_64F, 0, 1)
    scharr_mag = np.sqrt(scharr_x**2 + scharr_y**2)
    scharr_bin = (scharr_mag >= (threshold * 3)).astype(np.uint8) * 255

    return {
        'original': img,
        'sobel': sobel_bin,
        'prewitt': prewitt_bin,
        'roberts': roberts_bin,
        'scharr': scharr_bin
    }
`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2 text-sky-800 text-xs font-extrabold uppercase tracking-widest mb-2">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>Tài Liệu Hướng Dẫn & Báo Cáo Đồ Án</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Đề Tài 22: Phát Hiện Biên Sử Dụng Các Toán Tử Đạo Hàm Bậc Nhất
        </h2>
        <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
          Tài liệu chuẩn mực theo giáo trình Xử lý ảnh số (Digital Image Processing - Gonzalez & Woods). Bạn có thể sao chép trực tiếp nội dung để làm đề cương báo cáo, slide thuyết trình và nộp đồ án.
        </p>
      </div>

      {/* 1. Bản chất toán học của Đạo hàm bậc nhất */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
          <Lightbulb className="w-5 h-5 text-sky-600" />
          <h3 className="font-extrabold text-lg text-slate-900">
            1. Bản Chất Toán Học: Tại Sao Dùng Đạo Hàm Bậc Nhất Để Tìm Biên?
          </h3>
        </div>

        <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
          <p>
            <strong>Định nghĩa đường biên (Edge):</strong> Trong ảnh số, biên là tập hợp các điểm ảnh mà tại đó <em>mức xám thay đổi đột ngột</em> giữa hai vùng lân cận (ví dụ: chuyển từ sáng sang tối hoặc ngược lại).
          </p>
          <p>
            <strong>Trong toán học giải tích:</strong> Tốc độ và hướng biến thiên của một hàm số 2 biến <code className="text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded-md font-mono font-bold">f(x, y)</code> được đo bằng <strong>Vector Gradient</strong>:
          </p>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50 border border-sky-200/80 text-center font-mono text-base sm:text-lg text-slate-900 font-extrabold shadow-2xs">
            ∇f = [ ∂f/∂x, ∂f/∂y ]ᵀ = [ Gx, Gy ]ᵀ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-2xs">
              <span className="font-bold text-sky-800 text-xs block mb-1">
                Độ lớn Gradient (Magnitude |G|):
              </span>
              <div className="font-mono text-slate-900 font-extrabold text-sm">|∇f| = √(Gx² + Gy²) ≈ |Gx| + |Gy|</div>
              <p className="text-xs text-slate-500 mt-2">
                Đặc trưng cho <strong>độ sắc nét / độ dốc</strong> của bờ biên. Điểm có |G| càng lớn thì xác suất thuộc biên càng cao.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-amber-100 shadow-2xs">
              <span className="font-bold text-amber-800 text-xs block mb-1">
                Hướng Gradient (Direction θ):
              </span>
              <div className="font-mono text-slate-900 font-extrabold text-sm">θ(x, y) = arctan(Gy / Gx)</div>
              <p className="text-xs text-slate-500 mt-2">
                Chỉ hướng biến thiên mức xám nhanh nhất. <strong>Đường biên thực tế sẽ vuông góc</strong> với vector gradient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Chi tiết 4 toán tử */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
          <FileText className="w-5 h-5 text-sky-600" />
          <h3 className="font-extrabold text-lg text-slate-900">
            2. Chi Tiết 4 Toán Tử Đạo Hàm Bậc Nhất Tiêu Biểu
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sobel */}
          <div className="p-5 rounded-2xl bg-white/80 border border-sky-100 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-sky-900">A. Toán tử Sobel (1968)</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-mono font-bold">
                3×3
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toán tử Sobel là toán tử phổ biến nhất. Điểm mấu chốt là nó kết hợp phép <strong>làm trơn Gauss cục bộ</strong> theo vector <code className="text-sky-800 font-mono">[1, 2, 1]</code> và phép <strong>sai phân trung tâm</strong> <code className="text-sky-800 font-mono">[-1, 0, 1]</code>.
            </p>
            <div className="font-mono text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-cyan-300 space-y-1">
              <div>Kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]</div>
              <div>Ky = [[-1, -2, -1], [ 0,  0,  0], [ 1,  2,  1]]</div>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="text-emerald-700">Đánh giá:</strong> Chống nhiễu tốt, biên rõ nét, chuẩn mực thực tế.
            </div>
          </div>

          {/* Prewitt */}
          <div className="p-5 rounded-2xl bg-white/80 border border-cyan-100 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-cyan-900">B. Toán tử Prewitt (1970)</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-mono font-bold">
                3×3
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tương tự Sobel nhưng tất cả các hàng/cột đều có <strong>trọng số đồng đều bằng 1</strong> <code className="text-cyan-800 font-mono">[1, 1, 1]</code> thay vì gán trọng số 2 cho pixel tâm.
            </p>
            <div className="font-mono text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-cyan-300 space-y-1">
              <div>Kx = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]</div>
              <div>Ky = [[-1, -1, -1], [ 0,  0,  0], [ 1,  1,  1]]</div>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="text-emerald-700">Đánh giá:</strong> Cấu trúc ma trận đơn giản, phản hồi đối xứng, nhưng chống nhiễu hạt kém hơn Sobel một chút.
            </div>
          </div>

          {/* Roberts */}
          <div className="p-5 rounded-2xl bg-white/80 border border-amber-100 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-amber-900">C. Toán tử Roberts Cross (1963)</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold">
                2×2
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Là một trong những toán tử tách biên đầu tiên trong lịch sử xử lý ảnh. Sử dụng sai phân theo <strong>2 đường chéo góc 45° và 135°</strong> với ma trận chỉ kích thước 2×2.
            </p>
            <div className="font-mono text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-amber-300 space-y-1">
              <div>Kx = [[ 1,  0], [ 0, -1]]</div>
              <div>Ky = [[ 0,  1], [-1,  0]]</div>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="text-rose-700">Đánh giá:</strong> Tính toán cực nhanh, biên siêu mỏng (1 px), nhưng <em>rất nhạy cảm với nhiễu</em> vì không làm trơn.
            </div>
          </div>

          {/* Scharr */}
          <div className="p-5 rounded-2xl bg-white/80 border border-indigo-100 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-indigo-900">D. Toán tử Scharr (2000)</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold">
                3×3
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Được thiết kế để khắc phục nhược điểm mất đối xứng quay (rotational asymmetry) của Sobel khi góc nghiêng của cạnh thay đổi tự do trong không gian liên tục.
            </p>
            <div className="font-mono text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-indigo-300 space-y-1">
              <div>Kx = [[ -3, 0,  3], [-10, 0, 10], [ -3, 0,  3]]</div>
              <div>Ky = [[ -3,-10, -3], [  0, 0,  0], [  3, 10,  3]]</div>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="text-emerald-700">Đánh giá:</strong> Độ chính xác hướng biên tốt nhất trong các ma trận 3×3.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bảng so sánh tổng hợp */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
          <Table className="w-5 h-5 text-sky-600" />
          <h3 className="font-extrabold text-lg text-slate-900">
            3. Bảng So Sánh Tổng Hợp (Dùng Trả Lời Vấn Đáp Giáo Viên)
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-sky-100 shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700 border-collapse bg-white/80">
            <thead>
              <tr className="bg-sky-100/70 border-b border-sky-200 text-sky-950 font-bold">
                <th className="p-3.5">Toán tử</th>
                <th className="p-3.5">Kích thước</th>
                <th className="p-3.5">Tính chất làm trơn</th>
                <th className="p-3.5">Chống nhiễu</th>
                <th className="p-3.5">Độ dày viền</th>
                <th className="p-3.5">Tình huống áp dụng tối ưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-sky-50/50">
                <td className="p-3.5 font-sans font-bold text-slate-900">Sobel</td>
                <td className="p-3.5">3×3</td>
                <td className="p-3.5 font-sans">Gauss [1, 2, 1]</td>
                <td className="p-3.5 text-emerald-700 font-sans font-bold">Tốt (Cao)</td>
                <td className="p-3.5 font-sans">Trung bình (2-3 px)</td>
                <td className="p-3.5 font-sans text-slate-600">Ảnh thực tế có nhiễu nhẹ, nhận diện biển số, OCR</td>
              </tr>
              <tr className="hover:bg-sky-50/50">
                <td className="p-3.5 font-sans font-bold text-slate-900">Prewitt</td>
                <td className="p-3.5">3×3</td>
                <td className="p-3.5 font-sans">Đều [1, 1, 1]</td>
                <td className="p-3.5 text-amber-700 font-sans font-bold">Khá</td>
                <td className="p-3.5 font-sans">Trung bình</td>
                <td className="p-3.5 font-sans text-slate-600">Hệ thống nhúng yêu cầu phép nhân tối giản (+1, -1)</td>
              </tr>
              <tr className="hover:bg-sky-50/50">
                <td className="p-3.5 font-sans font-bold text-slate-900">Roberts Cross</td>
                <td className="p-3.5">2×2</td>
                <td className="p-3.5 font-sans text-rose-700">Không có</td>
                <td className="p-3.5 text-rose-700 font-sans font-bold">Kém (Rất nhạy)</td>
                <td className="p-3.5 font-sans text-emerald-700 font-bold">Mỏng nhất (1 px)</td>
                <td className="p-3.5 font-sans text-slate-600">Ảnh chất lượng cao, đồ họa vector, thời gian thực cao</td>
              </tr>
              <tr className="hover:bg-sky-50/50">
                <td className="p-3.5 font-sans font-bold text-slate-900">Scharr</td>
                <td className="p-3.5">3×3</td>
                <td className="p-3.5 font-sans">Tối ưu quay [3, 10, 3]</td>
                <td className="p-3.5 text-emerald-700 font-sans font-bold">Rất tốt</td>
                <td className="p-3.5 font-sans">Hơi dày</td>
                <td className="p-3.5 font-sans text-slate-600">Đo lường góc chính xác, đường cong cơ khí</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Mã nguồn Python nộp đồ án */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100/70 pb-3">
          <div className="flex items-center space-x-2 text-sky-900">
            <Code2 className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-lg text-slate-900">
              4. Mã Nguồn Tham Khảo (Python + OpenCV + Numpy)
            </h3>
          </div>

          <button
            onClick={() => copyToClipboard(pythonCode, 'python')}
            className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-3.5 py-2 rounded-xl font-bold transition-all shadow-md shadow-sky-500/25 active:scale-95 cursor-pointer"
          >
            {copiedCode === 'python' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép mã Python</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Đoạn mã Python chuẩn dưới đây thực hiện đầy đủ các bước của đề tài 22, có thể nộp kèm vào báo cáo:
        </p>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-x-auto text-xs font-mono text-cyan-300 shadow-2xl">
          <pre>{pythonCode}</pre>
        </div>
      </section>

      {/* 5. Gợi ý trả lời câu hỏi vấn đáp */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-lg text-slate-900">
            5. Câu Hỏi Thường Gặp Khi Bảo Vệ Đồ Án (Q&A Tips)
          </h3>
        </div>

        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-2xs">
            <h4 className="font-bold text-sky-900 mb-1">
              Câu 1: Tại sao tổng các hệ số trong mỗi mặt nạ Kx hoặc Ky luôn bằng 0?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Trả lời:</strong> Trong vùng ảnh đồng nhất (mức xám phẳng, không có bờ biên), giá trị các pixel bằng nhau. Vì tổng hệ số bằng 0, nên kết quả tích chập sẽ cho <code className="text-sky-900 font-mono font-bold">G = 0</code> (không phát hiện biên giả). Chỉ khi có sự chênh lệch mức xám giữa các pixel lân cận thì tổng mới khác 0.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-2xs">
            <h4 className="font-bold text-sky-900 mb-1">
              Câu 2: Tại sao toán tử Sobel lại giảm nhiễu tốt hơn Prewitt?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Trả lời:</strong> Vì Sobel sử dụng mặt nạ làm trơn tam giác [1, 2, 1] xấp xỉ hàm Gauss, gán trọng số lớn hơn (hệ số 2) cho pixel nằm thẳng hàng với tâm, giúp làm mờ nhiễu tần số cao trước khi lấy vi phân.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-2xs">
            <h4 className="font-bold text-sky-900 mb-1">
              Câu 3: Đạo hàm bậc nhất khác gì so với đạo hàm bậc hai (Laplacian)?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Trả lời:</strong> Đạo hàm bậc nhất tạo ra cực đại địa phương (đỉnh dốc) tại vị trí biên và có hướng (vector). Trong khi đó, đạo hàm bậc hai tạo ra điểm giao qua mức 0 (zero-crossing) và đẳng hướng (vô hướng), nhưng đạo hàm bậc 2 nhạy cảm với nhiễu gấp đôi đạo hàm bậc 1.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
