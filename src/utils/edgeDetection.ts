import { KernelDefinition, OperatorType, PixelInspection, ProcessingOptions } from '../types/edge';

export const OPERATOR_KERNELS: Record<OperatorType, KernelDefinition> = {
  sobel: {
    name: 'Sobel',
    size: 3,
    kx: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    ky: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
    description: 'Toán tử Sobel kết hợp làm trơn Gauss [1, 2, 1] và đạo hàm sai phân trung tâm [-1, 0, 1], giúp giảm nhiễu hiệu quả.',
    pros: 'Chống nhiễu tốt hơn Prewitt và Roberts; cạnh tương đối sắc nét; chuẩn mực trong thực tế.',
    cons: 'Kích thước biên đôi khi hơi dày; cần ngưỡng hóa thích hợp.',
    smoothingWeight: 'Làm trơn cục bộ với trọng số 2 ở tâm',
  },
  prewitt: {
    name: 'Prewitt',
    size: 3,
    kx: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    ky: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ],
    description: 'Toán tử Prewitt sử dụng trọng số đồng đều [1, 1, 1] để ước lượng đạo hàm bậc nhất theo hai hướng.',
    pros: 'Tính toán đơn giản, phản ứng đồng đều với biên theo các phương chính.',
    cons: 'Chống nhiễu kém hơn Sobel một chút vì không gán trọng số lớn hơn cho pixel trung tâm.',
    smoothingWeight: 'Làm trơn đều với trọng số 1',
  },
  roberts: {
    name: 'Roberts Cross',
    size: 2,
    kx: [
      [1, 0],
      [0, -1],
    ],
    ky: [
      [0, 1],
      [-1, 0],
    ],
    description: 'Toán tử Roberts Cross là toán tử đạo hàm bậc nhất nhỏ nhất (2x2), xấp xỉ đạo hàm theo 2 đường chéo góc 45° và 135°.',
    pros: 'Kích thước nhỏ (2x2), cực kỳ nhanh, biên rất mỏng (1 pixel).',
    cons: 'Rất nhạy cảm với nhiễu vì không có bước làm trơn; tâm đạo hàm nằm ở giữa các pixel.',
    smoothingWeight: 'Không làm trơn (2x2 sai phân chéo)',
  },
  scharr: {
    name: 'Scharr',
    size: 3,
    kx: [
      [-3, 0, 3],
      [-10, 0, 10],
      [-3, 0, 3],
    ],
    ky: [
      [-3, -10, -3],
      [0, 0, 0],
      [3, 10, 3],
    ],
    description: 'Toán tử Scharr là biến thể tối ưu của Sobel, giảm sai số bất đẳng hướng khi biên quay ở các góc xiên bất kỳ.',
    pros: 'Độ chính xác quay (rotational symmetry) cao nhất trong các toán tử 3x3 bậc nhất.',
    cons: 'Hệ số lớn (tới 10 và 16) nên nhạy hơn với biến đổi tần số cao.',
    smoothingWeight: 'Trọng số trung tâm cực đại [3, 10, 3]',
  },
};

/**
 * Convert ImageData to 2D Grayscale Float32Array
 */
export function imageToGrayscale(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    // Standard Luminance weights: 0.299 R + 0.587 G + 0.114 B
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }
  return gray;
}

/**
 * 3x3 Gaussian Blur filter for noise reduction
 */
export function applyGaussianBlur(
  src: Float32Array,
  width: number,
  height: number,
  passes: number
): Float32Array {
  if (passes <= 0) return new Float32Array(src);

  let current = new Float32Array(src);
  let next = new Float32Array(width * height);

  // Kernel [1, 2, 1] / 4 separable
  for (let p = 0; p < passes; p++) {
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - 1);
        const x2 = Math.min(width - 1, x + 1);
        next[rowOffset + x] =
          (current[rowOffset + x0] + 2 * current[rowOffset + x] + current[rowOffset + x2]) * 0.25;
      }
    }

    // Vertical pass
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const y0 = Math.max(0, y - 1);
        const y2 = Math.min(height - 1, y + 1);
        current[y * width + x] =
          (next[y0 * width + x] + 2 * next[y * width + x] + next[y2 * width + x]) * 0.25;
      }
    }
  }

  return current;
}

/**
 * Compute Otsu's optimal threshold on grayscale/magnitude data
 */
export function computeOtsuThreshold(data: Float32Array): number {
  const histogram = new Int32Array(256);
  let totalPixels = 0;

  for (let i = 0; i < data.length; i++) {
    const val = Math.min(255, Math.max(0, Math.round(data[i])));
    histogram[val]++;
    totalPixels++;
  }

  if (totalPixels === 0) return 128;

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

export interface EdgeFilterResult {
  outputImageData: ImageData;
  gxMap: Float32Array;
  gyMap: Float32Array;
  magnitudeMap: Float32Array;
  directionMap: Float32Array; // in radians
  binaryMap: Uint8Array; // 0 or 255
  computedThreshold: number;
  edgeCount: number;
  meanMagnitude: number;
  durationMs: number;
  grayscaleMap: Float32Array;
}

/**
 * Main edge detection calculation
 */
export function processEdgeDetection(
  sourceImageData: ImageData,
  options: ProcessingOptions
): EdgeFilterResult {
  const startTime = performance.now();
  const { width, height } = sourceImageData;
  const size = width * height;

  // 1. Grayscale
  let gray = imageToGrayscale(sourceImageData);

  // 2. Pre-processing: Gaussian Blur
  if (options.gaussianBlur > 0) {
    gray = applyGaussianBlur(gray, width, height, options.gaussianBlur);
  }

  const gxMap = new Float32Array(size);
  const gyMap = new Float32Array(size);
  const magnitudeMap = new Float32Array(size);
  const directionMap = new Float32Array(size);
  const binaryMap = new Uint8Array(size);

  const kernelDef = OPERATOR_KERNELS[options.operator];
  const is2x2 = kernelDef.size === 2; // Roberts

  let sumMag = 0;

  if (is2x2) {
    // Roberts Cross 2x2:
    // Gx = [ [1, 0], [0, -1] ] => I(x, y) - I(x+1, y+1)
    // Gy = [ [0, 1], [-1, 0] ] => I(x+1, y) - I(x, y+1)
    for (let y = 0; y < height - 1; y++) {
      const row = y * width;
      const nextRow = (y + 1) * width;
      for (let x = 0; x < width - 1; x++) {
        const p00 = gray[row + x];
        const p01 = gray[row + x + 1];
        const p10 = gray[nextRow + x];
        const p11 = gray[nextRow + x + 1];

        const gx = p00 - p11;
        const gy = p01 - p10;
        const mag = Math.sqrt(gx * gx + gy * gy);
        const idx = row + x;

        gxMap[idx] = gx;
        gyMap[idx] = gy;
        magnitudeMap[idx] = mag;
        directionMap[idx] = Math.atan2(gy, gx);
        sumMag += mag;
      }
    }
  } else {
    // 3x3 Convolution (Sobel, Prewitt, Scharr)
    const kx = kernelDef.kx;
    const ky = kernelDef.ky;

    for (let y = 1; y < height - 1; y++) {
      const r0 = (y - 1) * width;
      const r1 = y * width;
      const r2 = (y + 1) * width;

      for (let x = 1; x < width - 1; x++) {
        const p00 = gray[r0 + x - 1];
        const p01 = gray[r0 + x];
        const p02 = gray[r0 + x + 1];

        const p10 = gray[r1 + x - 1];
        const p11 = gray[r1 + x];
        const p12 = gray[r1 + x + 1];

        const p20 = gray[r2 + x - 1];
        const p21 = gray[r2 + x];
        const p22 = gray[r2 + x + 1];

        const gx =
          kx[0][0] * p00 + kx[0][1] * p01 + kx[0][2] * p02 +
          kx[1][0] * p10 + kx[1][1] * p11 + kx[1][2] * p12 +
          kx[2][0] * p20 + kx[2][1] * p21 + kx[2][2] * p22;

        const gy =
          ky[0][0] * p00 + ky[0][1] * p01 + ky[0][2] * p02 +
          ky[1][0] * p10 + ky[1][1] * p11 + ky[1][2] * p12 +
          ky[2][0] * p20 + ky[2][1] * p21 + ky[2][2] * p22;

        const mag = Math.sqrt(gx * gx + gy * gy);
        const idx = r1 + x;

        gxMap[idx] = gx;
        gyMap[idx] = gy;
        magnitudeMap[idx] = mag;
        directionMap[idx] = Math.atan2(gy, gx);
        sumMag += mag;
      }
    }
  }

  // Determine threshold
  let effectiveThreshold = options.threshold;
  if (options.autoOtsu) {
    // Normalize magnitude to 0-255 range for Otsu
    effectiveThreshold = computeOtsuThreshold(magnitudeMap);
  }

  // Binary Edge Map & Edge Count
  let edgeCount = 0;
  for (let i = 0; i < size; i++) {
    const isEdge = magnitudeMap[i] >= effectiveThreshold;
    binaryMap[i] = isEdge ? 255 : 0;
    if (isEdge) edgeCount++;
  }

  // Create Output ImageData for render
  const outputImgData = new ImageData(width, height);
  const out = outputImgData.data;

  // Color RGB helpers
  let edgeR = 255;
  let edgeG = 255;
  let edgeB = 255;
  if (options.edgeColor === 'cyan') {
    edgeR = 56;
    edgeG = 189;
    edgeB = 248;
  } else if (options.edgeColor === 'green') {
    edgeR = 74;
    edgeG = 222;
    edgeB = 128;
  } else if (options.edgeColor === 'amber') {
    edgeR = 251;
    edgeG = 191;
    edgeB = 36;
  }

  for (let i = 0; i < size; i++) {
    const pIdx = i * 4;
    out[pIdx + 3] = 255; // Alpha always 255

    switch (options.viewMode) {
      case 'magnitude': {
        const val = Math.min(255, Math.max(0, Math.round(magnitudeMap[i])));
        if (options.invertBinary) {
          const inv = 255 - val;
          out[pIdx] = inv;
          out[pIdx + 1] = inv;
          out[pIdx + 2] = inv;
        } else {
          out[pIdx] = (val * edgeR) / 255;
          out[pIdx + 1] = (val * edgeG) / 255;
          out[pIdx + 2] = (val * edgeB) / 255;
        }
        break;
      }
      case 'gx': {
        // Map Gx [-255..255] to [0..255]
        const val = Math.min(255, Math.max(0, Math.round(Math.abs(gxMap[i]))));
        out[pIdx] = val;
        out[pIdx + 1] = Math.round(val * 0.4);
        out[pIdx + 2] = Math.round(val * 0.4);
        break;
      }
      case 'gy': {
        // Map Gy [-255..255] to [0..255]
        const val = Math.min(255, Math.max(0, Math.round(Math.abs(gyMap[i]))));
        out[pIdx] = Math.round(val * 0.4);
        out[pIdx + 1] = val;
        out[pIdx + 2] = Math.round(val * 0.8);
        break;
      }
      case 'direction': {
        // Direction angle [-PI..PI] mapped to HSV color
        const mag = magnitudeMap[i];
        if (mag < 25) {
          out[pIdx] = 15;
          out[pIdx + 1] = 23;
          out[pIdx + 2] = 42;
        } else {
          const angle = directionMap[i]; // -PI to PI
          // Hue in [0..360]
          const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
          const [r, g, b] = hsvToRgb(hue, 0.9, Math.min(1, mag / 120));
          out[pIdx] = r;
          out[pIdx + 1] = g;
          out[pIdx + 2] = b;
        }
        break;
      }
      case 'binary':
      default: {
        const isEdge = binaryMap[i] === 255;
        if (options.invertBinary) {
          // White background, black edges
          const val = isEdge ? 0 : 255;
          out[pIdx] = val;
          out[pIdx + 1] = val;
          out[pIdx + 2] = val;
        } else {
          // Black background, highlighted edges
          if (isEdge) {
            out[pIdx] = edgeR;
            out[pIdx + 1] = edgeG;
            out[pIdx + 2] = edgeB;
          } else {
            out[pIdx] = 10;
            out[pIdx + 1] = 12;
            out[pIdx + 2] = 20;
          }
        }
        break;
      }
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

  return {
    outputImageData: outputImgData,
    gxMap,
    gyMap,
    magnitudeMap,
    directionMap,
    binaryMap,
    computedThreshold: effectiveThreshold,
    edgeCount,
    meanMagnitude: Math.round((sumMag / size) * 10) / 10,
    durationMs,
    grayscaleMap: gray,
  };
}

/**
 * Detailed step-by-step mathematical inspector at (x, y)
 */
export function inspectPixelAt(
  x: number,
  y: number,
  width: number,
  height: number,
  grayMap: Float32Array,
  operator: OperatorType,
  threshold: number
): PixelInspection {
  const kernelDef = OPERATOR_KERNELS[operator];
  const is2x2 = kernelDef.size === 2;

  // Safe clamping
  const cx = Math.max(0, Math.min(width - 1, Math.round(x)));
  const cy = Math.max(0, Math.min(height - 1, Math.round(y)));
  const grayVal = grayMap[cy * width + cx] || 0;

  if (is2x2) {
    const x0 = Math.min(width - 2, cx);
    const y0 = Math.min(height - 2, cy);

    const p00 = Math.round(grayMap[y0 * width + x0] || 0);
    const p01 = Math.round(grayMap[y0 * width + x0 + 1] || 0);
    const p10 = Math.round(grayMap[(y0 + 1) * width + x0] || 0);
    const p11 = Math.round(grayMap[(y0 + 1) * width + x0 + 1] || 0);

    const neighborhood = [
      [p00, p01],
      [p10, p11],
    ];

    const kx = kernelDef.kx;
    const ky = kernelDef.ky;

    const prodX = [
      [neighborhood[0][0] * kx[0][0], neighborhood[0][1] * kx[0][1]],
      [neighborhood[1][0] * kx[1][0], neighborhood[1][1] * kx[1][1]],
    ];

    const prodY = [
      [neighborhood[0][0] * ky[0][0], neighborhood[0][1] * ky[0][1]],
      [neighborhood[1][0] * ky[1][0], neighborhood[1][1] * ky[1][1]],
    ];

    const gx = prodX[0][0] + prodX[0][1] + prodX[1][0] + prodX[1][1];
    const gy = prodY[0][0] + prodY[0][1] + prodY[1][0] + prodY[1][1];
    const magnitude = Math.round(Math.sqrt(gx * gx + gy * gy) * 10) / 10;
    const angleDeg = Math.round((Math.atan2(gy, gx) * (180 / Math.PI) + 360) % 360);

    return {
      x: cx,
      y: cy,
      grayValue: grayVal,
      neighborhood,
      kernelX: kx,
      kernelY: ky,
      productX: prodX,
      productY: prodY,
      gx,
      gy,
      magnitude,
      angleDeg,
      isEdge: magnitude >= threshold,
      thresholdUsed: threshold,
    };
  }

  // 3x3 Inspector
  const x0 = Math.max(1, Math.min(width - 2, cx));
  const y0 = Math.max(1, Math.min(height - 2, cy));

  const neighborhood: number[][] = [];
  for (let dy = -1; dy <= 1; dy++) {
    const row: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      row.push(Math.round(grayMap[(y0 + dy) * width + (x0 + dx)] || 0));
    }
    neighborhood.push(row);
  }

  const kx = kernelDef.kx;
  const ky = kernelDef.ky;

  const prodX: number[][] = [];
  const prodY: number[][] = [];
  let gx = 0;
  let gy = 0;

  for (let i = 0; i < 3; i++) {
    const rowX: number[] = [];
    const rowY: number[] = [];
    for (let j = 0; j < 3; j++) {
      const px = neighborhood[i][j] * kx[i][j];
      const py = neighborhood[i][j] * ky[i][j];
      rowX.push(px);
      rowY.push(py);
      gx += px;
      gy += py;
    }
    prodX.push(rowX);
    prodY.push(rowY);
  }

  const magnitude = Math.round(Math.sqrt(gx * gx + gy * gy) * 10) / 10;
  const angleDeg = Math.round((Math.atan2(gy, gx) * (180 / Math.PI) + 360) % 360);

  return {
    x: cx,
    y: cy,
    grayValue: grayVal,
    neighborhood,
    kernelX: kx,
    kernelY: ky,
    productX: prodX,
    productY: prodY,
    gx,
    gy,
    magnitude,
    angleDeg,
    isEdge: magnitude >= threshold,
    thresholdUsed: threshold,
  };
}

/**
 * Convert HSV to RGB for gradient orientation visualization
 */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h >= 0 && h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}
