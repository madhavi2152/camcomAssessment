import {
  ADD_POINT_TO_CURRENT,
  CANCEL_CURRENT_POLYGON,
  CLEAR_ERROR,
  CLEAR_POLYGONS,
  DELETE_POLYGON,
  FINISH_CURRENT_POLYGON,
  RESET_ANNOTATIONS,
  SET_CURRENT_CLASS,
  SET_ERROR,
  SET_HOVERED_POLYGON,
  SET_IMAGE,
  SET_SELECTED_POLYGON,
  SET_UPLOAD_STATUS,
  START_NEW_POLYGON,
  UNDO_CURRENT_POINT,
  UPDATE_POLYGON_CLASS
} from "./actionTypes";

export function setUploadStatus(status) {
  return { type: SET_UPLOAD_STATUS, payload: status };
}

export function setImage(imageUrl) {
  return { type: SET_IMAGE, payload: imageUrl };
}

export function setError(message) {
  return { type: SET_ERROR, payload: message };
}

export function clearError() {
  return { type: CLEAR_ERROR };
}

export function setCurrentClass(classLabel) {
  return { type: SET_CURRENT_CLASS, payload: classLabel };
}

export function startNewPolygon() {
  return { type: START_NEW_POLYGON };
}

export function addPointToCurrent(point) {
  return { type: ADD_POINT_TO_CURRENT, payload: point };
}

export function undoCurrentPoint() {
  return { type: UNDO_CURRENT_POINT };
}

export function cancelCurrentPolygon() {
  return { type: CANCEL_CURRENT_POLYGON };
}

export function finishCurrentPolygon() {
  return { type: FINISH_CURRENT_POLYGON };
}

export function deletePolygon(id) {
  return { type: DELETE_POLYGON, payload: id };
}

export function updatePolygonClass(id, classLabel) {
  return { type: UPDATE_POLYGON_CLASS, payload: { id, classLabel } };
}

export function resetAnnotations() {
  return { type: RESET_ANNOTATIONS };
}

export function clearPolygons() {
  return { type: CLEAR_POLYGONS };
}

export function setHoveredPolygon(idOrNull) {
  return { type: SET_HOVERED_POLYGON, payload: idOrNull };
}

export function setSelectedPolygon(idOrNull) {
  return { type: SET_SELECTED_POLYGON, payload: idOrNull };
}




