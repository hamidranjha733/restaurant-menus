/**
 * Serve /out locally the way Vercel will: trailing-slash redirects, index.html
 * for folders, 404.html for missing pages. Usage: npm run serve [-- --port 4173]
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const portFlag = process.argv.indexOf("--port");
const PORT = Number(portFlag > -1 ? process.argv[portFlag + 1] : process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

function send(res, status, file) {
  res.writeHead(status, {
    "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "Cache-Control": file.includes(`${path.sep}_next${path.sep}`) ? "public, max-age=31536000, immutable" : "no-cache",
  });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const target = path.normalize(path.join(OUT, pathname));
    if (!target.startsWith(OUT)) return send(res, 404, path.join(OUT, "404.html"));

    if (fs.existsSync(target) && fs.statSync(target).isFile()) return send(res, 200, target);
    if (!pathname.endsWith("/") && !path.extname(pathname) && fs.existsSync(path.join(target, "index.html"))) {
      res.writeHead(308, { Location: `${pathname}/${url.search}` });
      return res.end();
    }
    const index = path.join(target, "index.html");
    if (fs.existsSync(index)) return send(res, 200, index);
    return send(res, 404, path.join(OUT, "404.html"));
  })
  .listen(PORT, () => console.log(`Serving ./out at http://localhost:${PORT}`));
