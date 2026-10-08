export type OperatorType = 'sobel' | 'prewitt' | 'roberts' | 'scharr';

export type ViewMode = 'magnitude' | 'gx' | 'gy' | 'direction' | 'binary';

export interface KernelDefinition {
  name: string;
  size: 2 | 3;
  kx: number[][];
  ky: number[][];
  description: string;
  pros: string;
  cons: string;
  smoothingWeight: string;
}

export interface ProcessingOptions {
  operator: OperatorType;
  threshold: number; // 0 to 255
  autoOtsu: boolean;
  gaussianBlur: number; // 0 (none), 1, 2, 3
  viewMode: ViewMode;
  invertBinary: boolean;
  edgeColor: string; // 'white' | 'cyan' | 'green' | 'amber'
}

export interface PixelInspection {
  x: number;
  y: number;
  grayValue: number;
  neighborhood: number[][]; // 2x2 or 3x3
  kernelX: number[][];
  kernelY: number[][];
  productX: number[][];
  productY: number[][];
  gx: number;
  gy: number;
  magnitude: number;
  angleDeg: number;
  isEdge: boolean;
  thresholdUsed: number;
}

export interface OperatorResultStats {
  operator: OperatorType;
  name: string;
  timeMs: number;
  edgePixelCount: number;
  edgePercentage: number;
  meanGradient: number;
  dataUrl: string;
}
