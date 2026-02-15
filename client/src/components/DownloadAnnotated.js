import React from "react";
import { useSelector } from "react-redux";
import { classToColors } from "../utils/colors";

function drawPolygon(ctx, points, classLabel) {
  if (!points || points.length < 3) return;
  const colors = classToColors(classLabel);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = colors.stroke;
  ctx.fillStyle = colors.fill;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for export."));
    img.src = src;
  });
}

export default function DownloadAnnotated() {
  const imageUrl = useSelector((s) => s.image.imageUrl);
  const polygons = useSelector((s) => s.annotation.polygons);

  async function onDownload() {
    if (!imageUrl) return;
    const img = await loadImage(imageUrl);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < polygons.length; i++) {
      drawPolygon(ctx, polygons[i].points, polygons[i].classLabel);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "annotated.jpeg";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.95
    );
  }

  return (
    <div className="panel">
      <div className="panelTitle">4) Download</div>
      <button
        type="button"
        className="btn btnPrimary"
        onClick={onDownload}
        disabled={!imageUrl || polygons.length === 0}
      >
        Download Annotated Image
      </button>
      <div className="hint small">Exports original image + filled polygons (color-coded by class) as JPEG.</div>
    </div>
  );
}




