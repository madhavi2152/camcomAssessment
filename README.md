# Image Polygon Annotation Tool (React + Node, .js only)

## Requirements implemented
- Upload image **max 10MB**, **.jpg/.jpeg only**
- Annotate using **polygon shapes**
- **Max 10 polygons per image**
- Each polygon classified as **Class 1 / 2 / 3**
- Download **annotated image**
- Frontend: **React.js** (all `.js`)
- State management: **Redux** (`redux` + `react-redux`)
- Backend: **Node.js/Express** for upload validation (all `.js`)

## Repo structure
- `client/`: React app (Create React App style)
- `server/`: Express API for image upload + static serving

## How to run (local)
### 1) Install
From the repo root:

```bash
npm run install:all
```

### 2) Start both client + server

```bash
npm run dev
```

## Notes
- Client runs on `http://localhost:3000`
- Server runs on `http://localhost:5000`
- Upload endpoint: `POST /upload` (field name: `image`)




