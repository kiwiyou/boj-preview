import { LoaderFunctionArgs } from "@vercel/remix";
import juice from "juice";
import satori from "satori";
import parseHTML from "html-react-parser";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

function loadFont(url: string) {
  return fetch(url).then((r) => r.arrayBuffer());
}

const texRegex = /(?:\\\(|\$)(.+)(?:\\\)|\$)/g;
const exRegex = /"([^"]+)ex"/g;

let init = false;
export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!init) {
    init = true;
    const res = await fetch(new URL(resvgWasm, request.url));
    await initWasm(res.arrayBuffer());
  }
  const pretendardRegular = await loadFont(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff"
  );
  const pretendardBold = await loadFont(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff"
  );
  const id = params.id;
  const title = params.title!;
  const level = params.level!;
  const replaced: string[] = [];
  for (const match of title.matchAll(texRegex)) {
    replaced.push(match[1]);
  }
  const tex: Record<string, string> = await fetch(
    "https://tex.jacob.workers.dev/json",
    {
      method: "POST",
      body: JSON.stringify({
        tex: replaced,
        key: true,
      }),
    }
  ).then((r) => r.json());
  const mathTitle = title.replaceAll(texRegex, (substr, math) =>
    tex[math].replaceAll(exRegex, (substr, size) => `"${size * 27}"`)
  );
  const styledTitle = juice(mathTitle);
  const htmlTitle = parseHTML(styledTitle);
  const icon = await fetch(`https://static.solved.ac/tier_small/${level}.svg`)
    .then((r) => r.text())
    .then((svg) => svg.replaceAll(/[가-힣]/g, ""));
  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          fontSize: 64,
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <img
          src={`data:image/svg+xml,${icon}`}
          height="72"
          style={{
            lineHeight: 72,
            verticalAlign: "middle",
          }}
        />{" "}
        <span>{id}</span>
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 1000,
          fontSize: 108,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {htmlTitle}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Pretendard",
          data: pretendardRegular,
          weight: 400,
        },
        {
          name: "Pretendard",
          data: pretendardBold,
          weight: 600,
        },
      ],
      embedFont: true,
    }
  );
  const pngData = new Resvg(svg, {}).render();
  return new Response(pngData.asPng(), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
}
