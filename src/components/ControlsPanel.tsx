import React, { useRef } from 'react';
import {
  Activity,
  Binary,
  Camera,
  Compass,
  Contrast,
  Eye,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react';
import { OperatorType, ProcessingOptions, ViewMode } from '../types/edge';
import { OPERATOR_KERNELS } from '../utils/edgeDetection';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface ControlsPanelProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  selectedSampleId: string;
  onSelectSample: (id: string) => void;
  onUploadImage: (file: File) => void;
  onOpenCamera: () => void;
  computedThreshold: number;
  stats: {
    durationMs: number;
    edgeCount: number;
    totalPixels: number;
    meanMagnitude: number;
  };
}

export function ControlsPanel({
  options,
  setOptions,
  selectedSampleId,
  onSelectSample,
  onUploadImage,
  onOpenCamera,
  computedThreshold,
  stats,
}: ControlsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const operators: { id: OperatorType; title: string; subtitle: string; tag: string }[] = [
    { id: 'sobel', title: 'Sobel', subtitle: '3×3 (Làm trơn Gauss)', tag: 'Phổ biến nhất' },
    { id: 'prewitt', title: 'Prewitt', subtitle: '3×3 (Trọng số đều)', tag: 'Tốc độ cao' },
    { id: 'roberts', title: 'Roberts Cross', subtitle: '2×2 (Nhanh, nhạy nhiễu)', tag: 'Viền siêu mỏng' },
    { id: 'scharr', title: 'Scharr', subtitle: '3×3 (Tối ưu xoay góc)', tag: 'Độ chính xác cao' },
  ];

  const viewModes: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'binary', label: 'Nhị phân (Binary)', icon: Binary },
    { id: 'magnitude', label: 'Độ lớn |G|', icon: Activity },
    { id: 'gx', label: 'Cạnh dọc Gx', icon: Eye },
    { id: 'gy', label: 'Cạnh ngang Gy', icon: Eye },
    { id: 'direction', label: 'Góc hướng θ', icon: Compass },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const currentKernel = OPERATOR_KERNELS[options.operator];
  const edgeRatio = stats.totalPixels > 0 ? ((stats.edgeCount / stats.totalPixels) * 100).toFixed(1) : '0';

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4 text-sm transition-all duration-300">
      {/* 1. Nguồn ảnh với nút Camera và Tải ảnh */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>1. Nguồn Ảnh Đầu Vào</span>
          </label>

          <div className="flex items-center space-x-1.5">
            {/* Button Chụp từ Camera */}
            <button
              onClick={onOpenCamera}
              className="flex items-center space-x-1.5 text-xs text-white bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-3 py-1.5 rounded-xl transition-all font-bold shadow-md shadow-sky-500/25 active:scale-95 cursor-pointer"
              title="Mở webcam và chụp ảnh trực tiếp"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp Camera</span>
            </button>

            {/* Button Tải ảnh từ máy */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 text-xs text-slate-700 hover:text-sky-900 bg-white/80 hover:bg-white border border-sky-200/80 px-2.5 py-1.5 rounded-xl transition-all font-semibold shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Tải ảnh</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* 6 Sample Image Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className={`group p-2.5 rounded-2xl text-left border transition-all duration-200 text-xs flex flex-col justify-between cursor-pointer ${
                selectedSampleId === sample.id
                  ? 'border-sky-400 bg-gradient-to-br from-sky-100/90 via-cyan-50/70 to-indigo-50/70 text-slate-900 ring-2 ring-sky-400/40 shadow-sm shadow-sky-400/20'
                  : 'border-white/70 bg-white/60 hover:bg-white/90 text-slate-700 hover:border-sky-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold truncate text-[11px] group-hover:text-sky-700 transition-colors">
                  {sample.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">{sample.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Chọn Toán tử Đạo hàm Bậc Nhất */}
      <div className="pt-2 border-t border-sky-100/60">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>2. Toán Tử Đạo Hàm Bậc Nhất</span>
          </label>
          <span className="text-[11px] text-indigo-700 font-mono font-bold bg-indigo-50/90 px-2 py-0.5 rounded-lg border border-indigo-200/60 shadow-2xs">
            {currentKernel.size}×{currentKernel.size}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {operators.map((op) => {
            const isSelected = options.operator === op.id;
            return (
              <button
                key={op.id}
                onClick={() => setOptions((prev) => ({ ...prev, operator: op.id }))}
                className={`p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-sky-400 bg-gradient-to-br from-sky-500/10 via-cyan-400/10 to-indigo-500/15 text-slate-900 ring-2 ring-sky-400/40 shadow-md shadow-sky-500/10'
                    : 'border-white/70 bg-white/60 hover:bg-white/95 text-slate-700 hover:border-sky-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">{op.title}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 shadow-xs shadow-cyan-400 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{op.subtitle}</span>
                <span className="mt-1.5 text-[9px] font-semibold text-sky-700 bg-sky-100/60 self-start px-1.5 py-0.5 rounded-md">
                  {op.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Short kernel memo */}
        <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white/80 to-indigo-50/60 border border-sky-100 text-[11px] text-slate-700 shadow-2xs">
          <div className="font-bold text-sky-800 mb-1 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
            <span>Đặc điểm toán tử {currentKernel.name}:</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">{currentKernel.description}</p>
        </div>
      </div>

      {/* 3. Chế độ hiển thị */}
      <div className="pt-2 border-t border-sky-100/60">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span>3. Chế Độ Hiển Thị Biên</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = options.viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setOptions((prev) => ({ ...prev, viewMode: mode.id }))}
                className={`p-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-400 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/25'
                    : 'border-white/70 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Ngưỡng hóa (Threshold) & Otsu */}
      <div className="pt-2 border-t border-sky-100/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              4. Ngưỡng Tách Biên (Threshold)
            </span>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white/80 px-2.5 py-1 rounded-xl border border-sky-100 shadow-2xs">
            <input
              type="checkbox"
              checked={options.autoOtsu}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, autoOtsu: e.target.checked }))
              }
              className="rounded bg-white border-slate-300 text-sky-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer accent-sky-600"
            />
            <span>Tự động Otsu</span>
          </label>
        </div>

        <div className="space-y-1.5 bg-white/60 p-3 rounded-2xl border border-white/80 shadow-2xs">
          <div className="flex justify-between text-xs text-slate-600 font-mono">
            <span>
              Ngưỡng T: <strong className="text-sky-700 text-sm">{options.autoOtsu ? computedThreshold : options.threshold}</strong>
              {options.autoOtsu && ' (Otsu tối ưu)'}
            </span>
            <span className="text-slate-400">0 → 255</span>
          </div>
          <input
            type="range"
            min="5"
            max="250"
            disabled={options.autoOtsu}
            value={options.autoOtsu ? computedThreshold : options.threshold}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, threshold: Number(e.target.value) }))
            }
            className={`w-full accent-sky-600 h-2 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-lg cursor-pointer ${
              options.autoOtsu ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <p className="text-[10px] text-slate-500">
            Điểm có độ lớn gradient G ≥ T được phân loại là CẠNH BIÊN.
          </p>
        </div>
      </div>

      {/* 5. Tiền xử lý & Tùy biến màu */}
      <div className="pt-2 border-t border-sky-100/60 grid grid-cols-2 gap-3">
        {/* Gaussian Blur */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Làm mờ Gauss (Khử nhiễu)
          </label>
          <select
            value={options.gaussianBlur}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, gaussianBlur: Number(e.target.value) }))
            }
            className="w-full bg-white/80 border border-sky-200/80 rounded-xl text-xs p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs cursor-pointer font-medium"
          >
            <option value={0}>Không làm trơn (0x)</option>
            <option value={1}>Làm trơn nhẹ (1x)</option>
            <option value={2}>Làm trơn vừa (2x)</option>
            <option value={3}>Làm trơn mạnh (3x)</option>
          </select>
        </div>

        {/* Edge color */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Màu đường viền biên
          </label>
          <select
            value={options.edgeColor}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, edgeColor: e.target.value }))
            }
            className="w-full bg-white/80 border border-sky-200/80 rounded-xl text-xs p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs cursor-pointer font-medium"
          >
            <option value="cyan">Xanh Luminous Cyan (Wow)</option>
            <option value="white">Trắng Tinh Khiết</option>
            <option value="green">Xanh Ngọc Lục (Matrix)</option>
            <option value="amber">Vàng Hoàng Gia (Gold)</option>
          </select>
        </div>
      </div>

      {/* Invert Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-white/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Contrast className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-700 font-medium">Đảo màu nền (Nền trắng biên đen)</span>
        </div>
        <input
          type="checkbox"
          checked={options.invertBinary}
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, invertBinary: e.target.checked }))
          }
          className="rounded bg-white border-slate-300 text-sky-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-sky-600"
        />
      </div>

      {/* Real-time stats card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-400/10 via-cyan-300/10 to-indigo-400/10 border border-sky-200/60 text-xs shadow-xs">
        <div className="font-bold text-sky-950 mb-2 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Thống kê thực thi:</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60 font-bold">
            {stats.durationMs} ms
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono text-[11px]">
          <div className="bg-white/60 p-2 rounded-xl border border-white/80">
            <span className="text-slate-500 block text-[10px] font-sans">Số điểm biên:</span>
            <strong className="text-slate-900 text-xs">{stats.edgeCount.toLocaleString()}</strong> ({edgeRatio}%)
          </div>
          <div className="bg-white/60 p-2 rounded-xl border border-white/80">
            <span className="text-slate-500 block text-[10px] font-sans">Gradient TB:</span>
            <strong className="text-slate-900 text-xs">{stats.meanMagnitude}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
