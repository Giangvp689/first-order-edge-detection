import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, SwitchCamera, Upload, X } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: ImageData) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedImageData, setCapturedImageData] = useState<ImageData | null>(null);
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);

  // Start stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhotoUrl(null);
      setCapturedImageData(null);
      setErrorMessage(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);

    // Check if navigator.mediaDevices and getUserMedia exist
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Trình duyệt hoặc môi trường hiện tại không hỗ trợ webcam trực tiếp. Bạn có thể sử dụng tính năng Chụp ảnh thiết bị bên dưới.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Camera access warning/error:', err);
      const error = err as Error;
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError' ||
        (error.message && error.message.toLowerCase().includes('permission denied'))
      ) {
        setErrorMessage('Quyền truy cập Camera bị từ chối trong trình duyệt. Bạn có thể cấp quyền trong cài đặt trình duyệt (biểu tượng ổ khóa trên thanh địa chỉ) hoặc dùng nút "Mở Camera Thiết Bị" bên dưới.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('Không tìm thấy thiết bị Camera / Webcam trên máy tính của bạn.');
      } else {
        setErrorMessage('Không thể mở Camera: ' + (error.message || 'Lỗi cấp quyền'));
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Trigger shutter flash animation
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const targetW = 480;
    const targetH = Math.round((height * targetW) / width);

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/png');

    setCapturedImageData(imgData);
    setCapturedPhotoUrl(dataUrl);
  };

  // Fallback: Handles native camera capture via standard file input with capture="user"
  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
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
        const dataUrl = canvas.toDataURL('image/png');

        setCapturedImageData(imgData);
        setCapturedPhotoUrl(dataUrl);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedImageData(null);
    startCamera();
  };

  const handleConfirmUse = () => {
    if (capturedImageData) {
      onCapture(capturedImageData);
      onClose();
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col">
        {/* Hidden native camera capture input */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleNativeCameraFile}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50/60 via-white to-blue-50/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Chụp Ảnh Bằng Camera</h3>
              <p className="text-[11px] text-slate-500">Chụp khuôn mặt hoặc vật thể để đưa ngay vào thuật toán tách biên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[340px] sm:min-h-[380px] overflow-hidden">
          {isShutterActive && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200 pointer-events-none" />
          )}

          {errorMessage ? (
            <div className="p-6 text-center text-white max-w-md space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300 mb-1">Chưa thể mở Webcam trực tiếp</p>
                <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>

              {/* Robust Fallback Option */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Mở Camera Thiết Bị / Chọn Ảnh</span>
                </button>
                <button
                  onClick={startCamera}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Thử lại Webcam
                </button>
              </div>
            </div>
          ) : capturedPhotoUrl ? (
            // Preview captured photo
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={capturedPhotoUrl}
                alt="Ảnh vừa chụp"
                className="max-h-[350px] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
              />
              <div className="absolute top-4 left-4 bg-emerald-600/90 text-white px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur shadow">
                Ảnh đã chụp thành công
              </div>
            </div>
          ) : (
            // Live Video feed
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`max-h-[360px] w-auto object-contain rounded-lg ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {/* Center viewfinder guide */}
              <div className="absolute w-48 h-48 border-2 border-sky-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              </div>

              {/* Flip camera button */}
              <button
                onClick={handleToggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-800 transition-colors shadow-md backdrop-blur"
                title="Đổi camera trước / sau"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-sky-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>

          {capturedPhotoUrl ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetake}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chụp lại</span>
              </button>
              <button
                onClick={handleConfirmUse}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Sử dụng ảnh này</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => nativeCameraInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Mở ứng dụng camera gốc của thiết bị hoặc tải ảnh"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Camera thiết bị</span>
              </button>
              <button
                onClick={handleTakePhoto}
                disabled={!!errorMessage}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all active:scale-95 ${
                  errorMessage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Chụp Ảnh Ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
