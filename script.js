const upload = document.getElementById('upload');
const thresholdInput = document.getElementById('threshold');
const ditheringSelect = document.getElementById('dithering');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const gammaInput = document.getElementById('gamma');
const pixelSizeInput = document.getElementById('pixelSize');
const sharpnessInput = document.getElementById('sharpness');
const invertColorsInput = document.getElementById('invertColors');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let originalImage = null;

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyFilter();
  };
});

[
  thresholdInput,
  ditheringSelect,
  brightnessInput,
  contrastInput,
  gammaInput,
  pixelSizeInput,
  sharpnessInput,
  invertColorsInput
].forEach(control => {
  control.addEventListener('input', applyFilter);
  control.addEventListener('change', applyFilter);
});

function applyFilter() {
  if (!originalImage) return;
  const threshold = parseInt(thresholdInput.value);
  const brightness = parseInt(brightnessInput.value);
  const contrast = parseFloat(contrastInput.value);
  const gamma = parseFloat(gammaInput.value);
  const pixelSize = parseInt(pixelSizeInput.value);
  const sharpness = parseInt(sharpnessInput.value);
  const invert = invertColorsInput.checked;
  const method = ditheringSelect.value;

  // Copy image
  let imageData = new ImageData(
    new Uint8ClampedArray(originalImage.data),
    originalImage.width,
    originalImage.height
  );

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Pixelation step
  if (pixelSize > 1) {
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];

        for (let dy = 0; dy < pixelSize; dy++) {
          for (let dx = 0; dx < pixelSize; dx++) {
            if (y + dy >= height || x + dx >= width) continue;
            const j = ((y + dy) * width + (x + dx)) * 4;
            data[j] = r;
            data[j + 1] = g;
            data[j + 2] = b;
          }
        }
      }
    }
  }

  // Sharpness (simple kernel)
  if (sharpness > 0) {
    const kernel = [
      0, -1, 0,
      -1, 5 + sharpness, -1,
      0, -1, 0
    ];
    imageData = applyConvolution(imageData, width, height, kernel);
  }

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    let avg = (r + g + b) / 3;

    // Brightness and contrast
    avg = Math.min(255, Math.max(0, contrast * avg + brightness));

    // Gamma correction
    avg = 255 * Math.pow(avg / 255, 1 / gamma);

    // Threshold and dithering
    let color = 0;
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);

    const bayer = [
      [15, 7, 13, 5],
      [3, 11, 1, 9],
      [12, 4, 14, 6],
      [0, 8, 2, 10]
    ];

    if (method === 'none') {
      color = avg > threshold ? 255 : 0;
    } else if (method === 'random') {
      const noise = Math.random() * 255;
      color = avg > noise ? 255 : 0;
    } else if (method === 'bayer') {
      const matrixVal = bayer[y % 4][x % 4];
      const adjusted = (matrixVal / 16) * 255;
      color = avg > adjusted ? 255 : 0;
    } else if (method === 'checkerboard') {
      const pattern = (x + y) % 2 === 0;
      color = avg > threshold + (pattern ? 40 : -40) ? 255 : 0;
    } else if (method === 'horizontal-stripes') {
      const stripe = y % 4 < 2;
      color = avg > threshold + (stripe ? 30 : -30) ? 255 : 0;
    } else if (method === 'vertical-stripes') {
      const stripe = x % 4 < 2;
      color = avg > threshold + (stripe ? 30 : -30) ? 255 : 0;
    } else if (method === 'diagonal-lines') {
      const stripe = (x + y) % 6 < 3;
      color = avg > threshold + (stripe ? 40 : -40) ? 255 : 0;
    }

    if (invert) color = 255 - color;
    data[i] = data[i + 1] = data[i + 2] = color;
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyConvolution(imageData, width, height, kernel) {
  const output = ctx.createImageData(width, height);
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);

  const src = imageData.data;
  const dst = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const px = x + kx - halfSide;
          const py = y + ky - halfSide;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const i = (py * width + px) * 4;
            const weight = kernel[ky * side + kx];
            r += src[i] * weight;
            g += src[i + 1] * weight;
            b += src[i + 2] * weight;
          }
        }
      }
      const i = (y * width + x) * 4;
      dst[i] = Math.min(255, Math.max(0, r));
      dst[i + 1] = Math.min(255, Math.max(0, g));
      dst[i + 2] = Math.min(255, Math.max(0, b));
      dst[i + 3] = 255;
    }
  }
  return output;
}

function applyPreset(name) {
  if (name === 'gritty') {
    thresholdInput.value = 90;
    brightnessInput.value = -20;
    contrastInput.value = 2.0;
    gammaInput.value = 1.2;
    pixelSizeInput.value = 2;
    sharpnessInput.value = 3;
    ditheringSelect.value = 'random';
  } else if (name === 'clean') {
    thresholdInput.value = 150;
    brightnessInput.value = 10;
    contrastInput.value = 1.2;
    gammaInput.value = 1;
    pixelSizeInput.value = 1;
    sharpnessInput.value = 0;
    ditheringSelect.value = 'none';
  } else if (name === 'highcontrast') {
    thresholdInput.value = 128;
    brightnessInput.value = 0;
    contrastInput.value = 3.0;
    gammaInput.value = 1;
    pixelSizeInput.value = 1;
    sharpnessInput.value = 2;
    ditheringSelect.value = 'checkerboard';
  }
  applyFilter();
}

document.getElementById('download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'bitmap.png';
  link.href = canvas.toDataURL();
  link.click();
});

document.getElementById('download-svg').addEventListener('click', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] === 0) {
        svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;
      }
    }
  }
  svg += "</svg>";
  const blob = new Blob([svg], {type: "image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bitmap.svg';
  link.click();
});
