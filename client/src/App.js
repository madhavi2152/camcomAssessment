import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import AnnotationCanvas from "./components/AnnotationCanvas";

export default function App() {
  const imageUrl = useSelector((s) => s.image.imageUrl);
  const polygons = useSelector((s) => s.annotation.polygons);
  const current = useSelector((s) => s.annotation.current);
  const canvasApiRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function onToggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  function onResetView() {
    if (canvasApiRef.current && canvasApiRef.current.resetView) canvasApiRef.current.resetView();
  }

  function onDownload() {
    if (canvasApiRef.current && canvasApiRef.current.download) canvasApiRef.current.download();
  }

  const canDownload = Boolean(imageUrl && polygons.length > 0 && !current);

  return (
    <div className="appShell">
      <TopBar
        onToggleSidebar={onToggleSidebar}
        onResetView={onResetView}
        onDownload={onDownload}
        canDownload={canDownload}
      />
      <div className="main">
        <div className="hero">
          <AnnotationCanvas ref={canvasApiRef} />
        </div>
        <Sidebar isOpen={sidebarOpen} />
      </div>
    </div>
  );
}




