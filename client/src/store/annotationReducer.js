import {
  ADD_POINT_TO_CURRENT,
  CANCEL_CURRENT_POLYGON,
  CLEAR_POLYGONS,
  DELETE_POLYGON,
  FINISH_CURRENT_POLYGON,
  RESET_ANNOTATIONS,
  SET_CURRENT_CLASS,
  SET_HOVERED_POLYGON,
  SET_SELECTED_POLYGON,
  START_NEW_POLYGON,
  UNDO_CURRENT_POINT,
  UPDATE_POLYGON_CLASS
} from "./actionTypes";

const MAX_POLYGONS = 10;

const initialState = {
  polygons: [],
  current: null,
  currentClass: "Class 1",
  hoveredId: null,
  selectedId: null
};

function nextId(polygons) {
  let max = 0;
  for (let i = 0; i < polygons.length; i++) {
    if (polygons[i].id > max) max = polygons[i].id;
  }
  return max + 1;
}

export function annotationReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_CLASS:
      return { ...state, currentClass: action.payload };

    case START_NEW_POLYGON: {
      if (state.polygons.length >= MAX_POLYGONS) return state;
      if (state.current) return state;
      return {
        ...state,
        current: { points: [], classLabel: state.currentClass }
      };
    }

    case ADD_POINT_TO_CURRENT: {
      if (!state.current) return state;
      return {
        ...state,
        current: {
          ...state.current,
          points: [...state.current.points, action.payload]
        }
      };
    }

    case UNDO_CURRENT_POINT: {
      if (!state.current) return state;
      if (state.current.points.length === 0) return state;
      return {
        ...state,
        current: {
          ...state.current,
          points: state.current.points.slice(0, -1)
        }
      };
    }

    case CANCEL_CURRENT_POLYGON:
      return { ...state, current: null };

    case FINISH_CURRENT_POLYGON: {
      if (!state.current) return state;
      if (state.polygons.length >= MAX_POLYGONS) return { ...state, current: null };
      if (state.current.points.length < 3) return state;

      const newPoly = {
        id: nextId(state.polygons),
        points: state.current.points,
        classLabel: state.current.classLabel
      };
      return { ...state, polygons: [...state.polygons, newPoly], current: null };
    }

    case DELETE_POLYGON: {
      const id = action.payload;
      const nextPolys = state.polygons.filter((p) => p.id !== id);
      return {
        ...state,
        polygons: nextPolys,
        hoveredId: state.hoveredId === id ? null : state.hoveredId,
        selectedId: state.selectedId === id ? null : state.selectedId
      };
    }

    case UPDATE_POLYGON_CLASS: {
      const { id, classLabel } = action.payload;
      return {
        ...state,
        polygons: state.polygons.map((p) => (p.id === id ? { ...p, classLabel } : p))
      };
    }

    case SET_HOVERED_POLYGON:
      return { ...state, hoveredId: action.payload };

    case SET_SELECTED_POLYGON:
      return { ...state, selectedId: action.payload };

    case CLEAR_POLYGONS:
      return { ...state, polygons: [], current: null, hoveredId: null, selectedId: null };

    case RESET_ANNOTATIONS:
      return initialState;

    default:
      return state;
  }
}




