import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearPolygons, resetAnnotations, setError, setImage, setUploadStatus } from "../store/actions";
import { validateImageFile } from "../utils/validateImageFile";
import { classToColors } from "../utils/colors";
import { setCurrentClass } from "../store/actions";

const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3"];

function ClassChip({ label, active, disabled, onClick }) {
  const colors = classToColors(label);
  return (
    <button
      type="button"
      className={active ? "chipBtn active" : "chipBtn"}
      disabled={disabled}
      onClick={onClick}
      style={{
        borderColor: active ? colors.stroke : "rgba(255,255,255,0.12)",
        boxShadow: active ? `0 0 0 3px ${colors.fill}` : "none"
      }}
    >
      <span className="chipDot" style={{ background: colors.stroke }} />
      {label}
    </button>
  );
}

export default function TopBar({ onToggleSidebar, onResetView, onDownload }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  const imageUrl = useSelector((s) => s.image.imageUrl);
  const polygons = useSelector((s) => s.annotation.polygons);
  const current = useSelector((s) => s.annotation.current);
  const currentClass = useSelector((s) => s.annotation.currentClass);

  const max = 10;
  const count = polygons.length;
  const canDownload = Boolean(imageUrl && polygons.length > 0 && !current);

  async function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setLocalError(null);

    const v = validateImageFile(file);
    if (!v.ok) {
      setLocalError(v.error);
      return;
    }

    dispatch(setUploadStatus("uploading"));
    dispatch(resetAnnotations());

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && data.error) || "Upload failed.";
        dispatch(setError(msg));
        setLocalError(msg);
        dispatch(setUploadStatus("error"));
        return;
      }

      dispatch(setImage(data.imageUrl));
      dispatch(setUploadStatus("uploaded"));
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      const msg = err && err.message ? err.message : "Upload failed.";
      dispatch(setError(msg));
      setLocalError(msg);
      dispatch(setUploadStatus("error"));
    }
  }

  function openFilePicker() {
    if (inputRef.current) inputRef.current.click();
  }

  return (
    <div className="topBar">
      <div className="brand">
        <div className="brandName">Annotator</div>
        <div className="brandMeta">JPEG ≤ 10MB · 10 polygons max</div>
      </div>

      <div className="topControls">
        <button type="button" className="iconBtn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          ☰
        </button>

        <button type="button" className="btnPrimarySolid" onClick={openFilePicker}>
          Upload
        </button>
        <input
          ref={inputRef}
          className="hiddenInput"
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={onFileChange}
        />

        <button type="button" className="btn" onClick={onDownload} disabled={!canDownload}>
          Download
        </button>

        <div className="counter" aria-label="Polygon counter">
          <span className="counterNum">{count}</span>
          <span className="counterSep">/</span>
          <span className="counterMax">{max}</span>
        </div>

        <div className="chipGroup" aria-label="Class selector">
          {CLASS_OPTIONS.map((c) => (
            <ClassChip
              key={c}
              label={c}
              active={currentClass === c}
              disabled={!imageUrl}
              onClick={() => dispatch(setCurrentClass(c))}
            />
          ))}
        </div>

        <button type="button" className="btn" onClick={() => dispatch(clearPolygons())} disabled={!imageUrl || count === 0}>
          Clear
        </button>

        <button type="button" className="btn" onClick={onResetView} disabled={!imageUrl}>
          Reset View
        </button>
      </div>

      {localError ? <div className="topError">{localError}</div> : null}
    </div>
  );
}


