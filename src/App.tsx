/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ComparisonGrid } from './components/ComparisonGrid';
import { ControlsPanel } from './components/ControlsPanel';
import { ImageCanvasViewer } from './components/ImageCanvasViewer';
import { Navbar } from './components/Navbar';
import { PixelInspectorView } from './components/PixelInspectorView';
import { TheoryReportView } from './components/TheoryReportView';
import {
  OperatorType,
  PixelInspection,
  ProcessingOptions,
} from './types/edge';
import { inspectPixelAt, processEdgeDetection } from './utils/edgeDetection';
import { generateSampleImageData } from './utils/sampleImages';

const DEFAULT_OPTIONS: ProcessingOptions = {
  operator: 'sobel',
  threshold: 45,
  autoOtsu: false,
  gaussianBlur: 0,
  viewMode: 'binary',
  invertBinary: false,
  edgeColor: 'cyan',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'viewer' | 'compare' | 'inspector' | 'theory'>('viewer');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('cameraman');
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);

  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const [outputImageData, setOutputImageData] = useState<ImageData | null>(null);
  const [grayscaleMap, setGrayscaleMap] = useState<Float32Array | null>(null);
  const [computedThreshold, setComputedThreshold] = useState<number>(45);

  const [currentInspection, setCurrentInspection] = useState<PixelInspection | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const [stats, setStats] = useState({
    durationMs: 0,
    edgeCount: 0,
    totalPixels: 0,
    meanMagnitude: 0,
  });

  // Load sample image
  const loadSample = useCallback((sampleId: string) => {
    setSelectedSampleId(sampleId);
    try {
      const imgData = generateSampleImageData(sampleId, 480, 360);
      setSourceImageData(imgData);
    } catch (err) {
      console.error('Lỗi tạo ảnh mẫu:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSample('cameraman');
  }, [loadSample]);

  // Handle uploaded custom image
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const maxDim = 540;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        setSelectedSampleId('custom');
        setSourceImageData(imgData);
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle captured webcam photo
  const handleCameraCapture = (capturedData: ImageData) => {
    setSelectedSampleId('camera');
    setSourceImageData(capturedData);
  };

  // Run edge detection calculation whenever source or options change
  useEffect(() => {
    if (!sourceImageData) return;

    const result = processEdgeDetection(sourceImageData, options);
    setOutputImageData(result.outputImageData);
    setGrayscaleMap(result.grayscaleMap);
    setComputedThreshold(result.computedThreshold);

    const total = sourceImageData.width * sourceImageData.height;
    setStats({
      durationMs: result.durationMs,
      edgeCount: result.edgeCount,
      totalPixels: total,
      meanMagnitude: result.meanMagnitude,
    });

    const thresholdToUse = options.autoOtsu ? result.computedThreshold : options.threshold;
    if (currentInspection && grayscaleMap) {
      const updated = inspectPixelAt(
        currentInspection.x,
        currentInspection.y,
        sourceImageData.width,
        sourceImageData.height,
        result.grayscaleMap,
        options.operator,
        thresholdToUse
      );
      setCurrentInspection(updated);
    } else {
      const cx = Math.floor(sourceImageData.width / 2);
      const cy = Math.floor(sourceImageData.height / 2);
      const initInspect = inspectPixelAt(
        cx,
        cy,
        sourceImageData.width,
        sourceImageData.height,
        result.grayscaleMap,
        options.operator,
        thresholdToUse
      );
      setCurrentInspection(initInspect);
    }
  }, [sourceImageData, options]);

  // Navigate pixel by delta
  const handleNavigatePixel = (dx: number, dy: number) => {
    if (!currentInspection || !grayscaleMap || !sourceImageData) return;
    const nx = Math.max(1, Math.min(sourceImageData.width - 2, currentInspection.x + dx));
    const ny = Math.max(1, Math.min(sourceImageData.height - 2, currentInspection.y + dy));
    const thresholdToUse = options.autoOtsu ? computedThreshold : options.threshold;
    const inspect = inspectPixelAt(
      nx,
      ny,
      sourceImageData.width,
      sourceImageData.height,
      grayscaleMap,
      options.operator,
      thresholdToUse
    );
    setCurrentInspection(inspect);
  };

  // Select coordinates directly
  const handleSelectCoordinates = (x: number, y: number) => {
    if (!grayscaleMap || !sourceImageData) return;
    const thresholdToUse = options.autoOtsu ? computedThreshold : options.threshold;
    const inspect = inspectPixelAt(
      x,
      y,
      sourceImageData.width,
      sourceImageData.height,
      grayscaleMap,
      options.operator,
      thresholdToUse
    );
    setCurrentInspection(inspect);
  };

  // Reset to default
  const handleReset = () => {
    setOptions(DEFAULT_OPTIONS);
    loadSample('cameraman');
  };

  return (
    <div className="relative min-h-screen text-slate-800 flex flex-col font-sans overflow-x-hidden bg-slate-50 selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* 
        AUTHENTIC "WOW" LIQUID AURORA GRADIENT BACKGROUND
        Sắc màu loang mềm mại từ 4 góc, liên tục chuyển động bồng bềnh
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Góc trên trái: Sky Blue & Celestial Cyan Bloom */}
        <div className="absolute -top-36 -left-36 w-[540px] sm:w-[680px] h-[540px] sm:h-[680px] rounded-full bg-gradient-to-br from-cyan-400/40 via-sky-300/30 to-blue-500/10 blur-[100px] animate-aurora-1" />

        {/* Góc trên phải: Electric Indigo & Royal Sapphire Bloom */}
        <div className="absolute -top-36 -right-36 w-[560px] sm:w-[700px] h-[560px] sm:h-[700px] rounded-full bg-gradient-to-bl from-indigo-500/35 via-blue-400/25 to-purple-400/15 blur-[110px] animate-aurora-2" />

        {/* Góc dưới phải: Iridescent Lavender & Pink Opal Bloom */}
        <div className="absolute -bottom-40 -right-40 w-[580px] sm:w-[720px] h-[580px] sm:h-[720px] rounded-full bg-gradient-to-tl from-purple-400/30 via-pink-300/20 to-sky-300/15 blur-[110px] animate-aurora-3" />

        {/* Góc dưới trái: Luminous Ice Mint & Aqua Emerald Bloom */}
        <div className="absolute -bottom-36 -left-36 w-[520px] sm:w-[650px] h-[520px] sm:h-[650px] rounded-full bg-gradient-to-tr from-teal-400/35 via-emerald-300/25 to-cyan-300/15 blur-[100px] animate-aurora-1" />

        {/* Subtle center wash for high-contrast readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.7),transparent_75%)]" />

        {/* High-tech micro grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(14,165,233,0.12)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Top Navigation */}
      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onReset={handleReset}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'viewer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Image Canvas & Visual controls */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <ImageCanvasViewer
                sourceImageData={sourceImageData}
                outputImageData={outputImageData}
                grayscaleMap={grayscaleMap}
                options={options}
                computedThreshold={computedThreshold}
                onSelectInspection={(ins) => {
                  setCurrentInspection(ins);
                }}
                currentInspection={currentInspection}
              />

              {/* Quick Math Inspector preview below canvas */}
              {currentInspection && (
                <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs transition-all shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                    </span>
                    <span className="text-slate-700 font-medium">
                      Điểm đang soi: <strong className="text-slate-900 font-mono text-sm">({currentInspection.x}, {currentInspection.y})</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sky-800 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      Gx = {currentInspection.gx}
                    </span>
                    <span className="text-amber-800 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Gy = {currentInspection.gy}
                    </span>
                    <span className="text-slate-700 font-mono">
                      |G| = <strong className="text-indigo-900 text-sm">{currentInspection.magnitude}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('inspector')}
                    className="text-xs font-bold text-sky-800 hover:text-sky-950 bg-sky-100/70 hover:bg-sky-200/80 px-3.5 py-1.5 rounded-xl border border-sky-300/60 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                  >
                    Xem chi tiết phép tính tích chập →
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Controls Panel */}
            <div className="lg:col-span-4">
              <ControlsPanel
                options={options}
                setOptions={setOptions}
                selectedSampleId={selectedSampleId}
                onSelectSample={loadSample}
                onUploadImage={handleUploadImage}
                onOpenCamera={() => setIsCameraModalOpen(true)}
                computedThreshold={computedThreshold}
                stats={stats}
              />
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <ComparisonGrid
            sourceImageData={sourceImageData}
            baseOptions={options}
            onSelectOperator={(op: OperatorType) => {
              setOptions((prev) => ({ ...prev, operator: op }));
              setActiveTab('viewer');
            }}
          />
        )}

        {activeTab === 'inspector' && (
          <PixelInspectorView
            inspection={currentInspection}
            options={options}
            computedThreshold={computedThreshold}
            imageWidth={sourceImageData?.width || 0}
            imageHeight={sourceImageData?.height || 0}
            onNavigatePixel={handleNavigatePixel}
            grayscaleMap={grayscaleMap}
            onSelectCoordinates={handleSelectCoordinates}
          />
        )}

        {activeTab === 'theory' && <TheoryReportView />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sky-100/80 bg-white/60 backdrop-blur-md py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          Đồ án Môn Xử Lý Ảnh Số — Đề tài 22: Phát hiện biên sử dụng một số toán tử tiêu biểu sử dụng đạo hàm bậc nhất (Sobel, Prewitt, Roberts Cross, Scharr).
        </div>
      </footer>
    </div>
  );
}
