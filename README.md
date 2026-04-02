# AsymmetricExp

Base template for a Three.js project with WebXR VR support.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown by Vite. Click "Enter VR" on a compatible headset/browser.

### VS Code Live Server

This template also works with Live Server because `index.html` includes an import map for `three` and `three/addons/`.

- Open `index.html` with Live Server.
- Keep in mind this mode uses CDN modules.
- For builds and dependency pinning from `node_modules`, prefer the Vite workflow above.

## Scripts

- `npm run dev`: Start local dev server.
- `npm run build`: Build for production.
- `npm run preview`: Preview the production build.

## Notes

- VR requires a WebXR-capable browser and device.
- For headset testing, run over HTTPS or localhost depending on device/browser requirements.

## Project Structure

```
.
|- index.html
|- package.json
|- src/
|  |- main.js
|  |- style.css
|- vite.config.js
```