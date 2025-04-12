const upload = document.getElementById('upload');
const thresholdInput = document.getElementById('threshold');
const ditheringSelect = document.getElementById('dithering');
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

function applyFilter() {
  if (!originalImage) return;
  const imageData = new ImageData(
    new Uint8ClampedArray(originalImage.data),
    originalImage.width,
    originalImage.height
  );
  const threshold = parseInt(thresholdInput.value);
  const method = ditheringSelect.value;
  const bayer = [
    [15, 7, 13, 5],
    [3, 11, 1, 9],
    [12, 4, 14, 6],
    [0, 8, 2, 10]
  ];
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const i = (y * imageData.width + x) * 4;
      const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
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
      }
      imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = color;
    }
  }
  ctx.putImageData(imageData, 0, 0);
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
