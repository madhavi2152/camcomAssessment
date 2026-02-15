export function classToColors(classLabel) {
  switch (classLabel) {
    case "Class 1":
      return { stroke: "rgba(255, 59, 48, 1)", fill: "rgba(255, 59, 48, 0.22)" };
    case "Class 2":
      return { stroke: "rgba(52, 199, 89, 1)", fill: "rgba(52, 199, 89, 0.22)" };
    case "Class 3":
      return { stroke: "rgba(0, 122, 255, 1)", fill: "rgba(0, 122, 255, 0.22)" };
    default:
      return { stroke: "rgba(175, 82, 222, 1)", fill: "rgba(175, 82, 222, 0.22)" };
  }
}




