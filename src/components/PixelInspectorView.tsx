import React from 'react';
import {
  Calculator,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { PixelInspection, ProcessingOptions } from '../types/edge';
import { OPERATOR_KERNELS } from '../utils/edgeDetection';

interface PixelInspectorViewProps {
  inspection: PixelInspection | null;
  options: ProcessingOptions;
  computedThreshold: number;
  imageWidth: number;
  imageHeight: number;
  onNavigatePixel: (dx: number, dy: number) => void;
  grayscaleMap: Float32Array | null;
  onSelectCoordinates: (x: number, y: number) => void;
}

export function PixelInspectorView({
  inspection,
  options,
  computedThreshold,
  imageWidth,
  imageHeight,
  onNavigatePixel,
}: PixelInspectorViewProps) {
  if (!inspection) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[420px] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 border border-sky-300 flex items-center justify-center text-sky-600 mb-4 shadow-md shadow-sky-500/10">
          <Calculator className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 mb-2">
          Chưa chọn điểm ảnh (Pixel) để phân tích
        </h3>
        <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
          Hãy quay lại tab <strong>1. Phòng thí nghiệm Biên</strong> và click chuột vào bất kỳ vị trí nào trên ảnh để xem chi tiết từng phép nhân chập ma trận và công thức toán học tại điểm đó!
        </p>
      </div>
    );
  }

  const kernelDef = OPERATOR_KERNELS[options.operator];
  const is2x2 = kernelDef.size === 2;
  const effectiveThreshold = options.autoOtsu ? computedThreshold : options.threshold;

  return (
    <div className="space-y-6">
      {/* Top Banner & Pixel Coordinate Controls */}
      <div className="glass-panel rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-300/60">
                Tọa Độ Khảo Sát
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 font-mono font-bold border border-indigo-200">
                X = {inspection.x}, Y = {inspection.y}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              Phép Tích Chập Đạo Hàm Bậc Nhất ({kernelDef.name})
            </h2>
          </div>
        </div>

        {/* Navigation Step Arrows */}
        <div className="flex items-center space-x-2 bg-white/70 p-1.5 rounded-2xl border border-sky-100 shadow-2xs">
          <span className="text-xs text-slate-500 px-2 font-bold">Dịch chuyển pixel:</span>
          <button
            onClick={() => onNavigatePixel(-1, 0)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-mono font-extrabold border border-sky-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Sang trái 1 pixel"
          >
            ←
          </button>
          <button
            onClick={() => onNavigatePixel(0, -1)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-mono font-extrabold border border-sky-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Lên trên 1 pixel"
          >
            ↑
          </button>
          <button
            onClick={() => onNavigatePixel(0, 1)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-mono font-extrabold border border-sky-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Xuống dưới 1 pixel"
          >
            ↓
          </button>
          <button
            onClick={() => onNavigatePixel(1, 0)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-mono font-extrabold border border-sky-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Sang phải 1 pixel"
          >
            →
          </button>
        </div>
      </div>

      {/* Grid of Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Local Gray Matrix */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              1. Ma Trận Điểm Ảnh Lân Cận I(x, y)
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Mức xám thực tế (0 = Đen, 255 = Trắng) trong vùng lân cận {kernelDef.size}×{kernelDef.size} quanh tâm:
          </p>

          {/* Matrix Visualization */}
          <div className="flex justify-center py-2">
            <div
              className={`grid gap-2.5 text-center font-mono ${
                is2x2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {inspection.neighborhood.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const isCenter = is2x2 ? rIdx === 0 && cIdx === 0 : rIdx === 1 && cIdx === 1;
                  return (
                    <div
                      key={`n-${rIdx}-${cIdx}`}
                      className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all duration-200 ${
                        isCenter
                          ? 'border-sky-400 bg-gradient-to-tr from-sky-200/90 to-cyan-100/90 text-sky-950 font-extrabold ring-4 ring-sky-400/25 shadow-md shadow-sky-400/20'
                          : 'border-white/80 bg-white/70 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{val}</span>
                      {isCenter && (
                        <span className="text-[9px] text-sky-800 font-sans font-bold">Tâm (x, y)</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs text-slate-700 flex items-center justify-between">
            <span>Mức xám tại tâm:</span>
            <strong className="text-sky-950 font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-sky-200">
              {Math.round(inspection.grayValue)} / 255
            </strong>
          </div>
        </div>

        {/* Step 2: Kernels Kx and Ky */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-900 border-b border-sky-100/70 pb-3">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              2. Mặt Nạ Hạt Nhân (Kernels Kx & Ky)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Kernel Kx */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-800 block text-center">
                Mặt nạ Kx (Đạo hàm hướng X)
              </span>
              <div
                className={`grid gap-1.5 text-center font-mono ${
                  is2x2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {inspection.kernelX.map((row, rIdx) =>
                  row.map((kVal, cIdx) => (
                    <div
                      key={`kx-${rIdx}-${cIdx}`}
                      className={`h-11 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all ${
                        kVal > 0
                          ? 'border-emerald-300 bg-emerald-50/90 text-emerald-800 shadow-2xs'
                          : kVal < 0
                          ? 'border-rose-300 bg-rose-50/90 text-rose-800 shadow-2xs'
                          : 'border-white/80 bg-white/60 text-slate-400'
                      }`}
                    >
                      {kVal > 0 ? `+${kVal}` : kVal}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kernel Ky */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-800 block text-center">
                Mặt nạ Ky (Đạo hàm hướng Y)
              </span>
              <div
                className={`grid gap-1.5 text-center font-mono ${
                  is2x2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {inspection.kernelY.map((row, rIdx) =>
                  row.map((kVal, cIdx) => (
                    <div
                      key={`ky-${rIdx}-${cIdx}`}
                      className={`h-11 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all ${
                        kVal > 0
                          ? 'border-emerald-300 bg-emerald-50/90 text-emerald-800 shadow-2xs'
                          : kVal < 0
                          ? 'border-rose-300 bg-rose-50/90 text-rose-800 shadow-2xs'
                          : 'border-white/80 bg-white/60 text-slate-400'
                      }`}
                    >
                      {kVal > 0 ? `+${kVal}` : kVal}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center">
            Kx phản ứng với đường biên thẳng đứng. Ky phản ứng với đường biên nằm ngang.
          </p>
        </div>
      </div>

      {/* Step 3: Convolution Computation & Decision */}
      <div className="glass-panel rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-2 text-sky-900 border-b border-sky-100/70 pb-3">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h3 className="font-extrabold text-base uppercase tracking-wide">
            3. Phép Tính Tích Chập & Kết Quả Phân Loại Biên
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gx Calculation */}
          <div className="p-4 rounded-2xl bg-white/80 border border-sky-200/80 space-y-1.5 shadow-2xs">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-800">
              Đạo Hàm Hướng X (Gx)
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">
              Gx = {inspection.gx}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Gx = ∑ (I[i,j] × Kx[i,j])
            </p>
          </div>

          {/* Gy Calculation */}
          <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/80 space-y-1.5 shadow-2xs">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800">
              Đạo Hàm Hướng Y (Gy)
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">
              Gy = {inspection.gy}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Gy = ∑ (I[i,j] × Ky[i,j])
            </p>
          </div>

          {/* Magnitude & Direction */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/15 via-cyan-400/15 to-indigo-500/15 border border-sky-300 space-y-1.5 shadow-xs">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-900">
              Độ Lớn Gradient (|G|)
            </span>
            <div className="text-2xl font-mono font-extrabold text-indigo-950">
              |G| = {inspection.magnitude}
            </div>
            <p className="text-[11px] text-indigo-800 font-mono">
              |G| = √(Gx² + Gy²)
            </p>
            <div className="text-[11px] text-slate-600 font-mono">
              Góc hướng θ = {inspection.angleDeg}°
            </div>
          </div>
        </div>

        {/* Final Classification Decision Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
            inspection.isEdge
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950 shadow-md shadow-emerald-500/10'
              : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            {inspection.isEdge ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 animate-bounce" />
            ) : (
              <XCircle className="w-8 h-8 text-slate-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-base font-extrabold">
                {inspection.isEdge
                  ? 'KẾT LUẬN: ĐÂY LÀ ĐIỂM BIÊN (Edge Pixel)'
                  : 'KẾT LUẬN: ĐÂY LÀ ĐIỂM NỀN (Background Pixel)'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Quy tắc so sánh ngưỡng: Độ lớn |G| ({inspection.magnitude}){' '}
                {inspection.isEdge ? '≥' : '<'} Ngưỡng T ({effectiveThreshold})
              </div>
            </div>
          </div>

          <div className="font-mono text-sm px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            Xuất nhị phân:{' '}
            <strong className={inspection.isEdge ? 'text-emerald-700 text-base font-extrabold' : 'text-slate-500'}>
              {inspection.isEdge ? '255 (Biên Sáng)' : '0 (Nền Tối)'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
