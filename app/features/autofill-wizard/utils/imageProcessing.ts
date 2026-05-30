export const getBinarizedCanvas = (file: File): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Could not get canvas context'));
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const color = luminance > 128 ? 255 : 0;
        
        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
      }
      
      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const processImages = async (docs: File[]): Promise<File[]> => {
  const Tesseract = (await import('tesseract.js')).default;
  return Promise.all(
    docs.map(async (doc) => {
      if (!doc.type.startsWith('image/')) {
        return doc;
      }
      try {
        const binarizedCanvas = await getBinarizedCanvas(doc);
        const result = await Tesseract.recognize(binarizedCanvas, 'eng');
        const text = result.data.text;
        return new File([text], `${doc.name}.txt`, { type: 'text/plain' });
      } catch (err) {
        console.error("Error processing image:", err);
        throw err;
      }
    })
  );
};
