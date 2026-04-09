# Ziply

Batch image compressor. Upload images, pick format and quality, download a compressed zip.

## Stack

- **Frontend:** Vue 3 + Vite + Tailwind CSS
- **Backend:** Fastify + TypeScript + Sharp + Piscina
- **Monorepo:** Turborepo

## Getting Started

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

## Usage

1. Select format (JPEG, WebP, PNG) and quality (70–90)
2. Drag & drop images (up to 100 files, 50MB each)
3. Watch real-time per-image compression progress
4. Download the zip

## Deployment

```bash
docker compose up --build
```

Served on port 3001.
