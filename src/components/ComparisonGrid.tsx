import React, { useMemo } from 'react';
import { Download, Sparkles, Zap } from 'lucide-react';
import { OperatorType, ProcessingOptions } from '../types/edge';
import { OPERATOR_KERNELS, processEdgeDetection } from '../utils/edgeDetection';

interface ComparisonGridProps {
  sourceImageData: ImageData | null;
  baseOptions: ProcessingOptions;
  onSelectOperator: (op: OperatorType) => void;
}

export function ComparisonGrid({
  sourceImageData,
  baseOptions,
  onSelectOperator,
}: ComparisonGridProps) {
  // Compute results for all 4 operators
  const comparisonResults = useMemo(() => {
    if (!sourceImageData) return [];

    const operators: OperatorType[] = ['sobel', 'prewitt', 'roberts', 'scharr'];

    return operators.map((op) => {
      const opts: ProcessingOptions = {
        ...baseOptions,
        operator: op,
      };

      const result = processEdgeDetection(sourceImageData, opts);

      const canvas = document.createElement('canvas');
      canvas.width = sourceImageData.width;
      canvas.height = sourceImageData.height;
      canvas.getContext('2d')?.putImageData(result.outputImageData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');

      const totalPixels = sourceImageData.width * sourceImageData.height;
      const edgePct = totalPixels > 0 ? ((result.edgeCount / totalPixels) * 100).toFixed(1) : '0';

      return {
        operator: op,
        kernelDef: OPERATOR_KERNELS[op],
        dataUrl,
        durationMs: result.durationMs,
        edgeCount: result.edgeCount,
        edgePct,
        meanMagnitude: result.meanMagnitude,
        computedThreshold: result.computedThreshold,
      };
    });
  }, [sourceImageData, baseOptions]);

  const handleDownloadSingle = (dataUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `edge_compare_${name}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-sky-700 text-xs font-extrabold uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Thực Nghiệm So Sánh Song Song</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Đối Chiếu 4 Toán Tử Đạo Hàm Bậc Nhất
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Thực hiện song song trên cùng một khung hình với tham số chuẩn (Ngưỡng T = {baseOptions.threshold}, Chế độ: {baseOptions.viewMode.toUpperCase()}) để đo đạc thời gian tính toán và độ sắc nét.
          </p>
        </div>

        <div className="text-xs text-slate-700 bg-white/80 border border-sky-200/80 px-4 py-2.5 rounded-2xl shadow-2xs font-semibold">
          Chế độ hiện tại: <strong className="text-sky-800 font-mono text-sm">{baseOptions.viewMode}</strong>
        </div>
      </div>

      {/* Grid of 4 Operators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparisonResults.map((item) => {
          const isCurrent = baseOptions.operator === item.operator;
          return (
            <div
              key={item.operator}
              className={`glass-panel rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? 'ring-3 ring-sky-400 shadow-xl shadow-sky-500/15 border-sky-400'
                  : 'hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-sky-100/70 bg-gradient-to-r from-white/90 via-sky-50/40 to-white/90 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-sky-500/25">
                    {item.kernelDef.size}×{item.kernelDef.size}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <span>{item.kernelDef.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                          Đang chọn
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">{item.kernelDef.smoothingWeight}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadSingle(item.dataUrl, item.operator)}
                  className="p-2 rounded-xl text-slate-600 hover:text-sky-800 hover:bg-white border border-sky-100 transition-colors shadow-2xs cursor-pointer"
                  title="Tải ảnh kết quả"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Image Preview */}
              <div className="p-5 bg-gradient-to-b from-slate-900/5 to-transparent flex items-center justify-center border-b border-sky-100/60">
                <img
                  src={item.dataUrl}
                  alt={item.kernelDef.name}
                  className="max-h-60 rounded-2xl object-contain border-2 border-white shadow-xl bg-white"
                />
              </div>

              {/* Stats Benchmarks */}
              <div className="p-5 space-y-3.5 bg-white/70">
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                    <span className="text-[10px] text-emerald-700 block font-bold">Thời gian</span>
                    <strong className="text-emerald-950 font-mono text-sm">{item.durationMs} ms</strong>
                  </div>
                  <div className="bg-sky-50/80 p-2.5 rounded-2xl border border-sky-200/80 shadow-2xs">
                    <span className="text-[10px] text-sky-700 block font-bold">Pixel biên</span>
                    <strong className="text-sky-950 font-mono text-xs">
                      {item.edgeCount.toLocaleString()} ({item.edgePct}%)
                    </strong>
                  </div>
                  <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200/80 shadow-2xs">
                    <span className="text-[10px] text-amber-700 block font-bold">Gradient TB</span>
                    <strong className="text-amber-950 font-mono text-sm">{item.meanMagnitude}</strong>
                  </div>
                </div>

                {/* Pros and cons */}
                <div className="text-[11px] space-y-1 text-slate-700 pt-1">
                  <div>
                    <span className="text-emerald-700 font-extrabold">Ưu điểm:</span> {item.kernelDef.pros}
                  </div>
                  <div>
                    <span className="text-rose-700 font-extrabold">Nhược điểm:</span> {item.kernelDef.cons}
                  </div>
                </div>

                {/* Select button */}
                <button
                  onClick={() => onSelectOperator(item.operator)}
                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-95 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400/40'
                      : 'bg-white hover:bg-sky-50 text-slate-800 border border-sky-200 shadow-2xs'
                  }`}
                >
                  {isCurrent ? 'Toán tử đang hoạt động' : `Chọn ${item.kernelDef.name} cho Phòng Thí Nghiệm`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
