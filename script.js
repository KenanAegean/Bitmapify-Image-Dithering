const upload = document.getElementById('upload');
const thresholdInput = document.getElementById('threshold');
const ditheringSelect = document.getElementById('dithering');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
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

thresholdInput.addEventListener('input', applyFilter);
ditheringSelect.addEventListener('change', applyFilter);
brightnessInput.addEventListener('input', applyFilter);
contrastInput.addEventListener('input', applyFilter);

function applyFilter() {
  if (!originalImage) return;
  const threshold = parseInt(thresholdInput.value);
  const brightness = parseInt(brightnessInput.value);
  const contrast = parseFloat(contrastInput.value);
  const method = ditheringSelect.value;

  const data = new Uint8ClampedArray(originalImage.data);
  const width = originalImage.width;
  const height = originalImage.height;

  function adjust(value) {
    return Math.min(255, Math.max(0, contrast * value + brightness));
  }

  const bayer = [
    [15, 7, 13, 5],
    [3, 11, 1, 9],
    [12, 4, 14, 6],
    [0, 8, 2, 10]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      avg = adjust(avg);
      let color = 0;

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

      data[i] = data[i + 1] = data[i + 2] = color;
    }
  }

  const imageData = new ImageData(data, width, height);
  ctx.putImageData(imageData, 0, 0);
}

function applyPreset(name) {
  if (name === 'gritty') {
    thresholdInput.value = 90;
    brightnessInput.value = -20;
    contrastInput.value = 2.0;
    ditheringSelect.value = 'random';
  } else if (name === 'clean') {
    thresholdInput.value = 150;
    brightnessInput.value = 10;
    contrastInput.value = 1.2;
    ditheringSelect.value = 'none';
  } else if (name === 'highcontrast') {
    thresholdInput.value = 128;
    brightnessInput.value = 0;
    contrastInput.value = 3.0;
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
