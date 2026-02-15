import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { resetAnnotations, setError, setImage, setUploadStatus } from "../store/actions";
import { validateImageFile } from "../utils/validateImageFile";

export default function ImageUploader() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);

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
    } catch (err) {
      const msg = err && err.message ? err.message : "Upload failed.";
      dispatch(setError(msg));
      setLocalError(msg);
      dispatch(setUploadStatus("error"));
    }
  }

  function onChooseClick() {
    if (inputRef.current) inputRef.current.click();
  }

  return (
    <div className="panel">
      <div className="panelTitle">1) Upload JPEG (max 10MB)</div>
      <div className="row">
        <button type="button" className="btn btnPrimary" onClick={onChooseClick}>
          Upload Image
        </button>
        <input
          ref={inputRef}
          className="hiddenInput"
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={onFileChange}
        />
      </div>
      {localError ? <div className="error">{localError}</div> : null}
    </div>
  );
}




