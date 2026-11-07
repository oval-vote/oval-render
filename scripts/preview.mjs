import { execFile, spawn } from "node:child_process";
import { watch } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";

const input = resolve(process.argv[2] ?? "tests/fixtures/franklin.oval");
const port = Number(process.env.PORT ?? 8001);
const clients = new Set();
let html = "";
let rendering = null;
let queued = false;

const RELOAD = `<script>
new EventSource("/events").onmessage = () => location.reload();
</script>`;

function render() {
  if (rendering) {
    queued = true;
    return;
  }
  rendering = new Promise((done) => {
    execFile(
      "node",
      ["src/cli.ts", input],
      { maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        html = error
          ? `<!doctype html><meta charset="utf-8"><title>Render failed</title><pre>${escape(stderr || error.message)}</pre>`
          : stdout.replace("</body>", `${RELOAD}</body>`);
        if (error) {
          console.error(stderr.trim() || error.message);
        } else {
          console.log(`rendered ${input}`);
        }
        for (const client of clients) {
          client.write("data: reload\n\n");
        }
        rendering = null;
        done();
        if (queued) {
          queued = false;
          render();
        }
      },
    );
  });
}

function escape(text) {
  return text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}

const server = createServer((request, response) => {
  if (request.url === "/events") {
    response.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    response.write("\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
});

let timer;
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(render, 150);
};
watch("src", { recursive: true }, schedule);
watch(input, schedule);

render();
server.listen(port, () => {
  const url = `http://localhost:${port}/`;
  console.log(`previewing ${input} at ${url}`);
  const opener = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform];
  if (opener) {
    spawn(opener, [url], {
      stdio: "ignore",
      detached: true,
      shell: process.platform === "win32",
    }).unref();
  }
});
