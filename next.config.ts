import type { NextConfig } from "next";
import path from "path";

// Pinna workspace-roten till presenter/ (där `next build` startar).
// Annars detekterar Turbopack root-monorepots package-lock.json
// (skapad av Scalingos npm install) och letar deps i fel mapp.
// path.resolve(".") funkar i både CJS och ESM till skillnad från
// __dirname eller import.meta.url.
const projectRoot = path.resolve(".");

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  // Tillåt Next.js dev-resurser (_next/*) åt tunnel-värdnamn så
  // `npm run present` fungerar. Cloudflare quick tunnels får
  // slumpmässiga subdomäner under trycloudflare.com, ngrok liknande.
  // Lägg till egna named tunnel-domäner här vid behov.
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.loca.lt",
    "172.20.*.*",
    "192.168.*.*",
  ],
};

export default nextConfig;
