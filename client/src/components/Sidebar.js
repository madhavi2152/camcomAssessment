import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePolygon, setHoveredPolygon, setSelectedPolygon, updatePolygonClass } from "../store/actions";
import { classToColors } from "../utils/colors";

const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3"];

function LegendRow({ label }) {
  const c = classToColors(label);
  return (
    <div className="legendRow">
      <span className="legendSwatch" style={{ background: c.stroke }} />
      <span className="legendText">{label}</span>
    </div>
  );
}

export default function Sidebar({ isOpen }) {
  const dispatch = useDispatch();
  const polygons = useSelector((s) => s.annotation.polygons);
  const hoveredId = useSelector((s) => s.annotation.hoveredId);
  const selectedId = useSelector((s) => s.annotation.selectedId);
  const has = polygons && polygons.length > 0;

  return (
    <div className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="sidebarSection">
        <div className="sidebarTitle">Polygons</div>
        {!has ? (
          <div className="muted">Draw on the canvas to create polygons.</div>
        ) : (
          <div className="polyList">
            {polygons.map((p) => {
              const colors = classToColors(p.classLabel);
              const isActive = p.id === selectedId;
              const isHover = p.id === hoveredId;
              return (
                <div
                  key={p.id}
                  className={isActive ? "polyCard active" : isHover ? "polyCard hover" : "polyCard"}
                  onMouseEnter={() => dispatch(setHoveredPolygon(p.id))}
                  onMouseLeave={() => dispatch(setHoveredPolygon(null))}
                  onClick={() => dispatch(setSelectedPolygon(p.id))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") dispatch(setSelectedPolygon(p.id));
                  }}
                  style={{ borderColor: isActive ? colors.stroke : "rgba(255,255,255,0.08)" }}
                >
                  <div className="polyLeft">
                    <div className="polyBadge" style={{ background: colors.fill, borderColor: colors.stroke }}>
                      #{p.id}
                    </div>
                    <div className="polyMeta">
                      <div className="polyName">{p.classLabel}</div>
                      <div className="muted">Points: {p.points.length}</div>
                    </div>
                  </div>

                  <div className="polyRight">
                    <select
                      className="select dark"
                      value={p.classLabel}
                      onChange={(e) => dispatch(updatePolygonClass(p.id, e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="iconBtn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(deletePolygon(p.id));
                      }}
                      aria-label={`Delete polygon ${p.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sidebarSection">
        <div className="sidebarTitle">Legend</div>
        <div className="legend">
          <LegendRow label="Class 1" />
          <LegendRow label="Class 2" />
          <LegendRow label="Class 3" />
        </div>
      </div>
    </div>
  );
}


