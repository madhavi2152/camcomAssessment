import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePolygon, updatePolygonClass } from "../store/actions";
import { classToColors } from "../utils/colors";

const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3"];

export default function PolygonList() {
  const dispatch = useDispatch();
  const polygons = useSelector((s) => s.annotation.polygons);

  if (!polygons || polygons.length === 0) {
    return (
      <div className="panel">
        <div className="panelTitle">3) Polygons</div>
        <div className="hint">No polygons yet.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panelTitle">3) Polygons</div>
      <div className="list">
        {polygons.map((p) => {
          const colors = classToColors(p.classLabel);
          return (
            <div key={p.id} className="listRow">
              <div className="badge" style={{ background: colors.fill, borderColor: colors.stroke }}>
                #{p.id}
              </div>
              <div className="listMeta">
                <div className="small">
                  Points: <b>{p.points.length}</b>
                </div>
                <label className="label small">
                  Class:
                  <select
                    className="select small"
                    value={p.classLabel}
                    onChange={(e) => dispatch(updatePolygonClass(p.id, e.target.value))}
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="button" className="btn btnDanger btnSmall" onClick={() => dispatch(deletePolygon(p.id))}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}




