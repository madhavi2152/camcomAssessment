import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPointToCurrent,
  cancelCurrentPolygon,
  finishCurrentPolygon,
  startNewPolygon,
  undoCurrentPoint
} from "../store/actions";
import { classToColors } from "../utils/colors";

const MAX_POLYGONS = 10;

function drawPolygon(ctx, points, classLabel, opts) {
  if (!points || points.length === 0) return;
  const colors = classToColors(classLabel);
  const isCurrent = Boolean(opts && opts.isCurrent);
  const isHover = Boolean(opts && opts.isHover);
  const isSelected = Boolean(opts && opts.isSelected);

  ctx.save();
  ctx.lineWidth = isCurrent || isSelected ? 3 : isHover ? 2.5 : 2;
  ctx.strokeStyle = colors.stroke;
  ctx.fillStyle = colors.fill;
  if (isSelected) {
    ctx.shadowBlur = 16;
    ctx.shadowColor = colors.stroke;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (!isCurrent && points.length >= 3) ctx.closePath();

  if (!isCurrent && points.length >= 3) ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.stroke;
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function AnnotationCanvasImpl(props, ref) {
  const dispatch = useDispatch();
  const imageUrl = useSelector((s) => s.image.imageUrl);
  const polygons = useSelector((s) => s.annotation.polygons);
  const current = useSelector((s) => s.annotation.current);
  const currentClass = useSelector((s) => s.annotation.currentClass);
  const hoveredId = useSelector((s) => s.annotation.hoveredId);
  const selectedId = useSelector((s) => s.annotation.selectedId);

  const imgRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const panRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const [imgLoaded, setImgLoaded] = useState(false);
  const canDraw = Boolean(imageUrl && imgLoaded);
  const remaining = MAX_POLYGONS - polygons.length;
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });

  const statusText = useMemo(() => {
    if (!imageUrl) return "Upload an image to start.";
    if (!imgLoaded) return "Loading image...";
    if (polygons.length >= MAX_POLYGONS) return "Polygon limit reached (10/10).";
    if (current) return "Click to add points, then Finish Polygon.";
    return "Click Start Polygon to begin drawing.";
  }, [current, imageUrl, imgLoaded, polygons.length]);

  const resizeCanvasToImage = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas) return;
    if (!img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < polygons.length; i++) {
      drawPolygon(ctx, polygons[i].points, polygons[i].classLabel, {
        isCurrent: false,
        isHover: polygons[i].id === hoveredId,
        isSelected: polygons[i].id === selectedId
      });
    }
    if (current) {
      drawPolygon(ctx, current.points, current.classLabel, { isCurrent: true });
    }
  }, [polygons, current, hoveredId, selectedId]);

  useEffect(() => {
    if (!imageUrl) {
      imgRef.current = null;
      setImgLoaded(false);
      return;
    }
    setImgLoaded(false);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => {
      imgRef.current = null;
      setImgLoaded(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!imgLoaded) return;
    resizeCanvasToImage();
    redraw();
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    const fit = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const scale = clamp(fit, 0.1, 3);
    const x = (rect.width - canvas.width * scale) / 2;
    const y = (rect.height - canvas.height * scale) / 2;
    setView({ scale, x, y });
  }, [imgLoaded, resizeCanvasToImage, redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getStagePoint(evt) {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return null;
    const rect = stage.getBoundingClientRect();
    const sx = (evt.clientX - rect.left - view.x) / view.scale;
    const sy = (evt.clientY - rect.top - view.y) / view.scale;
    if (sx < 0 || sy < 0 || sx > canvas.width || sy > canvas.height) return null;
    return { x: sx, y: sy };
  }

  function onStageClick(e) {
    if (!canDraw) return;
    const p = panRef.current;
    if (p.moved) {
      p.moved = false;
      return;
    }
    const pt = getStagePoint(e);
    if (!pt) return;
    if (!current) return;
    dispatch(addPointToCurrent({ x: pt.x, y: pt.y }));
  }

  function onStartPolygon() {
    if (!canDraw) return;
    if (polygons.length >= MAX_POLYGONS) return;
    dispatch(startNewPolygon());
  }

  function onFinishPolygon() {
    dispatch(finishCurrentPolygon());
  }

  function onUndoPoint() {
    dispatch(undoCurrentPoint());
  }

  function onCancelPolygon() {
    dispatch(cancelCurrentPolygon());
  }

  function onWheel(e) {
    if (!canDraw) return;
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY;
    const factor = delta > 0 ? 0.9 : 1.1;
    const nextScale = clamp(view.scale * factor, 0.25, 5);
    const wx = (mx - view.x) / view.scale;
    const wy = (my - view.y) / view.scale;
    const nx = mx - wx * nextScale;
    const ny = my - wy * nextScale;
    setView({ scale: nextScale, x: nx, y: ny });
  }

  function onPointerDown(e) {
    if (!canDraw) return;
    if (current) return;
    const p = panRef.current;
    p.dragging = true;
    p.moved = false;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.originX = view.x;
    p.originY = view.y;
  }

  function onPointerMove(e) {
    const p = panRef.current;
    if (!p.dragging) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) p.moved = true;
    setView((v) => ({ ...v, x: p.originX + dx, y: p.originY + dy }));
  }

  function onPointerUp() {
    const p = panRef.current;
    p.dragging = false;
  }

  const resetView = useCallback(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    const fit = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const scale = clamp(fit, 0.1, 3);
    const x = (rect.width - canvas.width * scale) / 2;
    const y = (rect.height - canvas.height * scale) / 2;
    setView({ scale, x, y });
  }, []);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redraw();
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
  }, [redraw]);

  useImperativeHandle(ref, () => ({ resetView, download }), [resetView, download]);

  return (
    <div className="canvasShell">
      {!imageUrl ? (
        <div className="emptyHero">Upload a JPEG to begin</div>
      ) : (
        <>
          <div className="canvasStatus">
            <div className="muted">{statusText}</div>
            <div className="zoomPill">{Math.round(view.scale * 100)}%</div>
            <div className="zoomPill">Remaining {remaining}</div>
            <button
              type="button"
              className="btn"
              onClick={onStartPolygon}
              disabled={!canDraw || Boolean(current) || polygons.length >= MAX_POLYGONS}
            >
              Start Polygon
            </button>
            <button
              type="button"
              className="btn"
              onClick={onFinishPolygon}
              disabled={!current || (current && current.points.length < 3)}
            >
              Finish Polygon
            </button>
            <button
              type="button"
              className="btn"
              onClick={onUndoPoint}
              disabled={!current || current.points.length === 0}
            >
              Undo Point
            </button>
            <button type="button" className="btn" onClick={onCancelPolygon} disabled={!current}>
              Cancel Polygon
            </button>
            {current ? (
              <div className="drawPill">
                {currentClass} · Points {current.points.length}
              </div>
            ) : null}
          </div>

          <div
            ref={stageRef}
            className={current ? "stage drawing" : "stage"}
            onClick={onStageClick}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            role="application"
            aria-label="Annotation canvas"
          >
            <div
              className="stageInner"
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "0 0"
              }}
            >
              <canvas ref={canvasRef} className="heroCanvas" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const AnnotationCanvas = React.forwardRef(AnnotationCanvasImpl);
export default AnnotationCanvas;




