import { CLEAR_ERROR, SET_ERROR, SET_IMAGE, SET_UPLOAD_STATUS } from "./actionTypes";

const initialState = {
  uploadStatus: "idle",
  imageUrl: null
};

export function imageReducer(state = initialState, action) {
  switch (action.type) {
    case SET_UPLOAD_STATUS:
      return { ...state, uploadStatus: action.payload };
    case SET_IMAGE:
      return { ...state, imageUrl: action.payload, uploadStatus: "uploaded" };
    case SET_ERROR:
      return { ...state, uploadStatus: "error" };
    case CLEAR_ERROR:
      return state;
    default:
      return state;
  }
}




