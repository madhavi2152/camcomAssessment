import { createStore, combineReducers } from "redux";
import { imageReducer } from "./imageReducer";
import { annotationReducer } from "./annotationReducer";

const rootReducer = combineReducers({
  image: imageReducer,
  annotation: annotationReducer
});

export const store = createStore(rootReducer);




