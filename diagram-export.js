(() => {
  if (window.exportReady) return;
  window.exportReady = true;
async function downloadPNG(scale = 4) {
    const svg = document.getElementById('diagram');
    if (!svg) {
      console.error('PNG export failed: #diagram not found');
      return;
    }

    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Remove console/debug <path> elements generated during debugging
    clone.querySelectorAll('path[stroke="#968F7F"]').forEach(path => {
      if (path.textContent.includes('console.debug')) {
        path.parentNode.removeChild(path);
      }
    });

    const { x, y, width, height } = svg.viewBox.baseVal;
    let serialized = new XMLSerializer().serializeToString(clone);
   if (!serialized.startsWith('<?xml')) {
     serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
   }

    serialized = serialized.replace(/&#xA;/g, ' ');

    const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    let bitmap;
    try {
      bitmap = await createImageBitmap(svgBlob);
    } catch (err) {
      console.error('createImageBitmap failed, falling back to Image', err);
      const fallbackUrl = URL.createObjectURL(svgBlob);
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(fallbackUrl);
          createImageBitmap(canvas).then(resolve).catch(reject);
        };
        img.onerror = () => {
          URL.revokeObjectURL(fallbackUrl);
          reject(new Error('Fallback image failed to load'));
        };
        img.src = fallbackUrl;
      }).catch(fallbackErr => {
        console.error('PNG export failed: fallback also failed', fallbackErr);
        console.debug('Serialized SVG:', serialized);
        return null;
      });
      if (!bitmap) return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(scale, scale);
    ctx.drawImage(bitmap, -x, -y);

    const link = document.createElement('a');
    link.download = `diagram@${scale}x.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  window.downloadPNG = downloadPNG;

})();
