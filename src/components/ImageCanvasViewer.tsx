import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  MousePointer,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PixelInspection, ProcessingOptions } from '../types/edge';
import { inspectPixelAt } from '../utils/edgeDetection';

interface ImageCanvasViewerProps {
  sourceImageData: ImageData | null;
  outputImageData: ImageData | null;
  grayscaleMap: Float32Array | null;
  options: ProcessingOptions;
  computedThreshold: number;
  onSelectInspection: (inspection: PixelInspection) => void;
  currentInspection: PixelInspection | null;
}

export function ImageCanvasViewer({
  sourceImageData,
  outputImageData,
  grayscaleMap,
  options,
  computedThreshold,
  onSelectInspection,
  currentInspection,
}: ImageCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer modes
  const [isSplitMode, setIsSplitMode] = useState<boolean>(true);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !outputImageData || !sourceImageData) return;

    const width = outputImageData.width;
    const height = outputImageData.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isSplitMode) {
      // Just render output
      ctx.putImageData(outputImageData, 0, 0);
    } else {
      // Split view: Left = Original, Right = Edge Detection
      const splitX = Math.round((splitPos / 100) * width);

      const tempOrigCanvas = document.createElement('canvas');
      tempOrigCanvas.width = width;
      tempOrigCanvas.height = height;
      tempOrigCanvas.getContext('2d')?.putImageData(sourceImageData, 0, 0);

      const tempEdgeCanvas = document.createElement('canvas');
      tempEdgeCanvas.width = width;
      tempEdgeCanvas.height = height;
      tempEdgeCanvas.getContext('2d')?.putImageData(outputImageData, 0, 0);

      ctx.clearRect(0, 0, width, height);

      // Draw original on left
      if (splitX > 0) {
        ctx.drawImage(
          tempOrigCanvas,
          0, 0, splitX, height,
          0, 0, splitX, height
        );
      }

      // Draw edge on right
      if (splitX < width) {
        ctx.drawImage(
          tempEdgeCanvas,
          splitX, 0, width - splitX, height,
          splitX, 0, width - splitX, height
        );
      }

      // Glowing Cyan Split divider line
      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();
      ctx.restore();
    }

    // Draw selected inspection point crosshair if exists
    if (currentInspection) {
      const { x, y } = currentInspection;
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 7, y - 7, 15, 15);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.restore();
    }
  }, [sourceImageData, outputImageData, isSplitMode, splitPos, currentInspection]);

  // Handle Split Dragging
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !grayscaleMap || !sourceImageData) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const thresholdToUse = options.autoOtsu ? computedThreshold : options.threshold;
      const inspection = inspectPixelAt(
        x,
        y,
        canvas.width,
        canvas.height,
        grayscaleMap,
        options.operator,
        thresholdToUse
      );
      onSelectInspection(inspection);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      setHoverCoords({ x, y });
    }
  };

  const handleDownload = () => {
    if (!outputImageData) return;
    const canvas = document.createElement('canvas');
    canvas.width = outputImageData.width;
    canvas.height = outputImageData.height;
    canvas.getContext('2d')?.putImageData(outputImageData, 0, 0);

    const link = document.createElement('a');
    link.download = `edge_${options.operator}_${options.viewMode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-300">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-sky-100/70 bg-gradient-to-r from-white/90 via-sky-50/40 to-white/90 gap-2">
        <div className="flex items-center space-x-2">
          {/* Split Mode Toggle Button */}
          <button
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              isSplitMode
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/25 ring-1 ring-sky-400/40'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-sky-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isSplitMode ? 'Vuốt Trượt So Sánh (Bật)' : 'Bật So Sánh Before / After'}</span>
          </button>

          <div className="hidden sm:flex items-center text-xs text-slate-500 space-x-1.5 pl-2 font-medium">
            <MousePointer className="w-3.5 h-3.5 text-sky-600 animate-bounce" />
            <span>Click vào pixel bất kỳ để soi ma trận con</span>
          </div>
        </div>

        {/* Right tools: Zoom & Download */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white/80 rounded-xl p-1 border border-sky-100 shadow-2xs text-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:text-sky-700 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 font-bold text-slate-800">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:text-sky-700 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-sky-700 rounded-lg hover:bg-sky-50 transition-colors border-l border-slate-200 ml-0.5 cursor-pointer"
              title="Khôi phục 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            title="Tải ảnh biên độ nét cao"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải ảnh</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleSplitMouseMove}
        onMouseUp={() => setIsDraggingSplit(false)}
        className="relative flex-1 bg-gradient-to-br from-slate-900/5 via-sky-500/5 to-indigo-900/5 flex items-center justify-center p-4 overflow-auto min-h-[380px] select-none"
      >
        {/* Futuristic Tech Grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18)_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative transition-transform duration-100 ease-out inline-block rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 bg-white"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoverCoords(null)}
            className="cursor-crosshair block max-w-full"
          />

          {/* Split Mode Labels & Handle */}
          {isSplitMode && sourceImageData && (
            <>
              {/* Left Badge: Gốc */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-white/80 text-slate-800 px-3 py-1 rounded-xl text-[11px] font-extrabold shadow-md pointer-events-none">
                Ảnh Gốc
              </div>

              {/* Right Badge: Biên */}
              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md border border-slate-700 text-cyan-300 px-3 py-1 rounded-xl text-[11px] font-extrabold shadow-md pointer-events-none flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Biên ({options.operator.toUpperCase()})</span>
              </div>

              {/* Glowing Draggable Handle */}
              <div
                style={{ left: `${splitPos}%` }}
                onMouseDown={() => setIsDraggingSplit(true)}
                className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize group z-10"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-125 transition-transform font-bold text-xs border-2 border-white">
                  ↔
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="px-5 py-2.5 bg-white/90 border-t border-sky-100/70 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          {hoverCoords ? (
            <span className="font-mono text-slate-700">
              Tọa độ trỏ: <strong className="text-sky-700 text-xs">({hoverCoords.x}, {hoverCoords.y})</strong>
            </span>
          ) : (
            <span>Di chuột vào ảnh để định vị điểm ảnh</span>
          )}

          {currentInspection && (
            <span className="text-rose-600 font-bold hidden sm:inline bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
              Điểm ({currentInspection.x}, {currentInspection.y}) • Độ lớn |G|: {currentInspection.magnitude}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
          <span>Kích thước: {outputImageData ? `${outputImageData.width} × ${outputImageData.height} px` : '--'}</span>
        </div>
      </div>
    </div>
  );
}
