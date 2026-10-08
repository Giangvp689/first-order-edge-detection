export interface SampleImageMeta {
  id: string;
  name: string;
  description: string;
  tag: string;
}

export const SAMPLE_IMAGES: SampleImageMeta[] = [
  {
    id: 'cameraman',
    name: 'Cameraman (Kinh Điển)',
    description: 'Bức ảnh kinh điển trong giáo trình xử lý ảnh với áo choàng đen, chân máy và tòa nhà phía xa',
    tag: 'Chuẩn quốc tế',
  },
  {
    id: 'portrait',
    name: 'Chân Dung Nghệ Thuật',
    description: 'Đường nét khuôn mặt, ánh mắt, mái tóc và đường cong mượt mà',
    tag: 'Đường cong',
  },
  {
    id: 'car',
    name: 'Xe Ô Tô & Biển Số',
    description: 'Thị giác máy tính thực tế: Nhận diện khung xe, đèn pha, bánh xe và biển số',
    tag: 'Thực tế',
  },
  {
    id: 'coins',
    name: 'Đồng Xu & Chi Tiết Nổi',
    description: 'Bài toán đếm vật thể và tách đường biên hình tròn đổ bóng',
    tag: 'Phân đoạn',
  },
  {
    id: 'noise',
    name: 'Mẫu Thử Nhiễu (Noise Test)',
    description: 'Ảnh bị nhiễm nhiễu muối tiêu để so sánh khả năng chống nhiễu của Sobel vs Roberts',
    tag: 'Khử nhiễu',
  },
  {
    id: 'shapes',
    name: 'Hình Học Đa Hướng',
    description: 'Tam giác, hình vuông, vòng tròn và đường chéo kiểm tra góc biên 0°, 45°, 90°',
    tag: 'Mẫu chuẩn',
  },
];

/**
 * Procedurally draws rich, high-fidelity sample test images onto canvas
 */
export function generateSampleImageData(id: string, width = 480, height = 360): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  ctx.imageSmoothingEnabled = true;

  switch (id) {
    case 'cameraman': {
      // Classic Cameraman DIP benchmark
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      sky.addColorStop(0, '#f1f5f9');
      sky.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Distant buildings skyline
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(20, 160, 60, 90);
      ctx.fillRect(70, 140, 80, 110);
      ctx.fillRect(140, 170, 70, 80);
      ctx.fillRect(200, 150, 90, 100);

      // Building windows
      ctx.fillStyle = '#f8fafc';
      for (let x = 80; x < 140; x += 15) {
        for (let y = 150; y < 240; y += 18) {
          ctx.fillRect(x, y, 7, 10);
        }
      }

      // Grassy field bottom
      const grass = ctx.createLinearGradient(0, height * 0.7, 0, height);
      grass.addColorStop(0, '#475569');
      grass.addColorStop(1, '#1e293b');
      ctx.fillStyle = grass;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);

      // Field horizontal lines
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      for (let y = height * 0.72; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Cameraman silhouette (Coat & hood)
      ctx.fillStyle = '#0f172a';

      // Head / Hood
      ctx.beginPath();
      ctx.arc(330, 95, 26, 0, Math.PI * 2);
      ctx.fill();

      // Face profile peak
      ctx.beginPath();
      ctx.moveTo(315, 95);
      ctx.lineTo(300, 100);
      ctx.lineTo(315, 108);
      ctx.fill();

      // Heavy winter coat body
      ctx.beginPath();
      ctx.moveTo(330, 120);
      ctx.lineTo(280, 260);
      ctx.lineTo(390, 260);
      ctx.lineTo(350, 120);
      ctx.closePath();
      ctx.fill();

      // Arm reaching out to camera
      ctx.lineWidth = 18;
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(335, 140);
      ctx.lineTo(270, 130);
      ctx.stroke();

      // Large professional camera
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(220, 110, 50, 36);

      // Lens barrel
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(205, 128, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(205, 128, 12, 0, Math.PI * 2);
      ctx.fill();

      // Tripod legs
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#0f172a';

      // Leg 1 (left)
      ctx.beginPath();
      ctx.moveTo(245, 145);
      ctx.lineTo(160, 340);
      ctx.stroke();

      // Leg 2 (center)
      ctx.beginPath();
      ctx.moveTo(245, 145);
      ctx.lineTo(245, 345);
      ctx.stroke();

      // Leg 3 (right)
      ctx.beginPath();
      ctx.moveTo(245, 145);
      ctx.lineTo(320, 340);
      ctx.stroke();
      break;
    }

    case 'portrait': {
      // Classic Lena-style artistic face & hat portrait
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#fde68a');
      bg.addColorStop(0.5, '#f472b6');
      bg.addColorStop(1, '#818cf8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Background vertical folds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 14;
      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 30, height);
        ctx.stroke();
      }

      // Elegant Hat brim
      ctx.save();
      ctx.translate(240, 130);
      ctx.rotate(-0.15);

      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 50, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#6b21a8';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3b0764';
      ctx.stroke();

      // Hat Ribbon
      ctx.beginPath();
      ctx.ellipse(0, -10, 100, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();

      // Feather
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(-60, -20);
      ctx.quadraticCurveTo(-110, -90, -160, -70);
      ctx.stroke();

      ctx.restore();

      // Face silhouette
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(240, 195, 55, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair strands
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(170, 140);
      ctx.quadraticCurveTo(150, 230, 180, 320);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(310, 140);
      ctx.quadraticCurveTo(330, 240, 300, 320);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#1e293b';
      // Left eye
      ctx.beginPath();
      ctx.arc(220, 185, 6, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.arc(260, 185, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(210, 175);
      ctx.quadraticCurveTo(220, 170, 230, 175);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(250, 175);
      ctx.quadraticCurveTo(260, 170, 270, 175);
      ctx.stroke();

      // Nose
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(240, 190);
      ctx.lineTo(245, 210);
      ctx.lineTo(238, 212);
      ctx.stroke();

      // Lips
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(240, 230, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shoulder / Clothes
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(150, 360);
      ctx.quadraticCurveTo(240, 270, 330, 360);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'car': {
      // Modern Sports Car on Road with License Plate
      // Sky & City
      const carSky = ctx.createLinearGradient(0, 0, 0, 200);
      carSky.addColorStop(0, '#38bdf8');
      carSky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = carSky;
      ctx.fillRect(0, 0, width, 200);

      // Distant mountains
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, 200);
      ctx.lineTo(100, 110);
      ctx.lineTo(230, 200);
      ctx.lineTo(360, 120);
      ctx.lineTo(480, 200);
      ctx.closePath();
      ctx.fill();

      // Road asphalt
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 200, width, height - 200);

      // Yellow road center divider line
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6;
      ctx.setLineDash([25, 20]);
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.lineTo(width, 320);
      ctx.stroke();
      ctx.setLineDash([]);

      // Car Body (Red Sports Car)
      ctx.fillStyle = '#dc2626';

      // Lower body chassis
      ctx.beginPath();
      ctx.roundRect(70, 185, 340, 75, [15, 30, 10, 10]);
      ctx.fill();

      // Car Roof cabin
      ctx.beginPath();
      ctx.moveTo(140, 185);
      ctx.lineTo(190, 125);
      ctx.lineTo(310, 125);
      ctx.lineTo(360, 185);
      ctx.closePath();
      ctx.fill();

      // Windows
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(195, 132);
      ctx.lineTo(240, 132);
      ctx.lineTo(240, 180);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(250, 180);
      ctx.lineTo(250, 132);
      ctx.lineTo(300, 132);
      ctx.lineTo(345, 180);
      ctx.closePath();
      ctx.fill();

      // Headlight & Taillight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(400, 200, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#991b1b';
      ctx.fillRect(70, 200, 8, 16);

      // Wheels
      const wheels = [145, 335];
      wheels.forEach((wx) => {
        // Tire
        ctx.beginPath();
        ctx.arc(wx, 260, 36, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#475569';
        ctx.stroke();

        // Rim
        ctx.beginPath();
        ctx.arc(wx, 260, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();

        // Rim spokes
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#334155';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          ctx.beginPath();
          ctx.moveTo(wx, 260);
          ctx.lineTo(wx + Math.cos(a) * 20, 260 + Math.sin(a) * 20);
          ctx.stroke();
        }
      });

      // License Plate on the side
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(215, 230, 60, 20);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#020617';
      ctx.strokeRect(215, 230, 60, 20);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('29A-888', 220, 244);
      break;
    }

    case 'coins': {
      // Dark slate tabletop with glowing coins
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Tabletop perspective lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let y = 50; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const coins = [
        { x: 100, y: 110, r: 44, color: '#f59e0b' },
        { x: 235, y: 125, r: 52, color: '#e2e8f0' },
        { x: 370, y: 100, r: 40, color: '#f59e0b' },
        { x: 160, y: 245, r: 48, color: '#cbd5e1' },
        { x: 310, y: 250, r: 60, color: '#f59e0b' },
      ];

      coins.forEach((c) => {
        // Drop shadow
        ctx.beginPath();
        ctx.arc(c.x + 4, c.y + 6, c.r, 0, Math.PI * 2);
        ctx.fillStyle = '#020617';
        ctx.fill();

        // Main coin face
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        // Inner engraved rim
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r - 8, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#475569';
        ctx.stroke();

        // Star symbol
        drawStar(ctx, c.x, c.y, 5, c.r - 20, c.r - 30, '#334155');
      });
      break;
    }

    case 'noise': {
      // Salt-and-pepper noise benchmark
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Large bright shape
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 90, 0, Math.PI * 2);
      ctx.fill();

      // Sharp colored rectangle frame
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 10;
      ctx.strokeRect(70, 70, width - 140, height - 140);

      // Add salt-and-pepper noise
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const noiseDensity = 0.08;
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < noiseDensity) {
          const noiseVal = Math.random() > 0.5 ? 255 : 0;
          data[i] = noiseVal;
          data[i + 1] = noiseVal;
          data[i + 2] = noiseVal;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'shapes':
    default: {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Solid bright box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, 50, 110, 110);

      // Bright circle
      ctx.beginPath();
      ctx.arc(260, 105, 55, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      // Sharp Triangle
      ctx.beginPath();
      ctx.moveTo(410, 50);
      ctx.lineTo(460, 150);
      ctx.lineTo(360, 150);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Diagonal cross bars
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#e2e8f0';

      ctx.beginPath();
      ctx.moveTo(40, 200);
      ctx.lineTo(160, 320);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(160, 200);
      ctx.lineTo(40, 320);
      ctx.stroke();

      // Concentric circles
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#a855f7';
      for (let r = 20; r <= 60; r += 20) {
        ctx.beginPath();
        ctx.arc(260, 260, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Star shape
      drawStar(ctx, 410, 260, 5, 50, 22, '#f43f5e');
      break;
    }
  }

  return ctx.getImageData(0, 0, width, height);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}
