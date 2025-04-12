# 🖼️ Bitmapify

**Bitmapify** is a free, open-source browser-based tool that transforms any image into stunning black-and-white bitmap art with advanced dithering and artistic effects. Built entirely on the client side using HTML5, CSS3, and JavaScript, Bitmapify ensures fast processing and full privacy with no server-side dependencies.

Live Demo: [https://kenanaegean.github.io/Bitmapify-Image-Dithering/](https://kenanaegean.github.io/Bitmapify-Image-Dithering/)

---

## ✨ Features

- **Adjustable Parameters**: Fine-tune **Threshold**, **Brightness**, **Contrast**, and **Gamma** for the perfect tonal balance.
- **Pixelation Control**: Adjust the pixelation level to create unique artistic effects.
- **Sharpness Filter**: Enhance detail with a convolution-based sharpness effect.
- **Invert Colors Option**: Easily swap black and white for creative contrasts.
- **Dithering Methods**: Choose from a variety of methods:
  - None
  - Random
  - Bayer
  - Checkerboard
  - Horizontal Stripes
  - Vertical Stripes
  - Diagonal Lines
- **Flexible File Handling**: Upload images in **PNG**, **JPG**, or **WEBP** formats.
- **Download Options**: Save your creations as high-quality **PNG** or **SVG** images.
- **Instant Preview**: Enjoy live rendering of adjustments in real time.
- **Offline Support**: Leverages a service worker for caching, ensuring the app works without an internet connection.
- **Fully Client-Side**: All image processing is done locally, with no data uploaded to any server.

---

## 📸 Screenshots

| Original Image | Processed Image |
|----------------|-----------------|
| ![original1](assets/forReadme/1.png) | ![processed1](assets/forReadme/3.png) |
| ![original2](assets/forReadme/2.png) | ![processed2](assets/forReadme/4.png) |

**Before Effect:**  
![Before Effect](assets/forReadme/before.png)

**After Effect:**  
![After Effect](assets/forReadme/after.png)

---

## 🛠️ Tech Stack

- **HTML5** + **CSS3**
- **JavaScript** (leveraging the Canvas API and SVG serialization)
- **Service Workers** for caching and offline functionality

---

## 📄 License

[MIT License](LICENSE) — Feel free to use and remix!

---

**Made by [Kenan Ege](https://github.com/KenanAegean)**
