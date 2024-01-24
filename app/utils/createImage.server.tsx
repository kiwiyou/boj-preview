import juice from 'juice';
import satori from 'satori';
import parseHTML from 'html-react-parser';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { cloneElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function loadFont(url: string) {
  return fetch(url).then((r) => r.arrayBuffer());
}

const texRegex = /(?:\\\(|\$)(.+)(?:\\\)|\$)/g;
const exRegex = /"([^"]+)ex"/g;
let init = false;
export async function createImage(
  url: string,
  id: string,
  title: string,
  level: string | null,
) {
  if (!init) {
    init = true;
    const hack = resvgWasm.replace(
      '/build/_assets',
      `/build/${process.env.HACK ?? ''}_assets`,
    );
    const res = await fetch(new URL(hack, url));
    await initWasm(res.arrayBuffer());
  }
  const pretendardRegular = await loadFont(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff',
  );
  const pretendardBold = await loadFont(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff',
  );

  const emojis: Record<string, string> = {
    '🅰': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f170.svg',
    '➕': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/2795.svg',
    '🅱': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f171.svg',
    '🐜': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f41c.svg',
  };
  const emojiReplacement: Record<string, string> = {};
  await Promise.all(
    Object.keys(emojis).map(async (key) => {
      if (title.includes(key)) {
        return await fetch(emojis[key])
          .then((r) => r.text())
          .then(
            (svg) =>
              (emojiReplacement[key] = svg.replace(
                '<svg',
                '<svg height="108"',
              )),
          );
      }
    }),
  );
  let emojiTitle = title;
  for (const key in emojiReplacement) {
    emojiTitle = emojiTitle.replaceAll(
      key,
      (substr) => emojiReplacement[substr],
    );
  }
  const mathReplacement: string[] = [];
  for (const match of emojiTitle.matchAll(texRegex)) {
    mathReplacement.push(match[1]);
  }
  let firstRender = emojiTitle;
  const hasMath = mathReplacement.length > 0;
  if (hasMath) {
    const tex: Record<string, string> = await fetch(
      'https://tex.jacob.workers.dev/json',
      {
        method: 'POST',
        body: JSON.stringify({
          tex: mathReplacement,
          key: true,
        }),
      },
    ).then((r) => r.json());
    firstRender = emojiTitle.replaceAll(texRegex, (substr, math) =>
      tex[math].replaceAll(exRegex, (substr, size) => `"${size * 27}"`),
    );
  }
  const styledTitle = juice(
    firstRender
      ? firstRender.replaceAll('<em', '<em style="font-style: italic;')
      : '&nbsp;',
  );
  const htmlTitle = parseHTML(styledTitle);
  let titleSvg;
  let size;
  if (hasMath) {
    titleSvg = await satori(
      <div
        style={{
          display: 'flex',
          width: 1000,
          justifyContent: 'center',
          fontSize: 108,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {htmlTitle}
      </div>,
      {
        width: 1000,
        fonts: [
          {
            name: 'Pretendard',
            data: pretendardRegular,
            weight: 400,
          },
          {
            name: 'Pretendard',
            data: pretendardBold,
            weight: 600,
          },
        ],
        embedFont: true,
      },
    );
    size = { width: 1000 };
  } else {
    const titleMultiline = await satori(
      <div
        style={{
          display: 'flex',
          width: 1000,
          fontSize: 54,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {htmlTitle}
      </div>,
      {
        width: 1000,
        fonts: [
          {
            name: 'Pretendard',
            data: pretendardRegular,
            weight: 400,
          },
          {
            name: 'Pretendard',
            data: pretendardBold,
            weight: 600,
          },
        ],
        embedFont: true,
      },
    );
    const titleSingleLine = await satori(
      <div
        style={{
          display: 'flex',
          height: 108,
          fontSize: 108,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {htmlTitle}
      </div>,
      {
        height: 108,
        fonts: [
          {
            name: 'Pretendard',
            data: pretendardRegular,
            weight: 400,
          },
          {
            name: 'Pretendard',
            data: pretendardBold,
            weight: 600,
          },
        ],
        embedFont: true,
      },
    );
    const svgWidth = +titleSingleLine.match(/width="(\d+)"/)![1];
    if (svgWidth > 1000) {
      titleSvg = titleMultiline;
      size = { width: 1000 };
    } else {
      titleSvg = titleSingleLine;
      size = { height: 108 };
    }
  }
  const titlePng = new Resvg(titleSvg, {
    imageRendering: 1,
  })
    .render()
    .asPng();
  const icon =
    level &&
    (await fetch(`https://static.solved.ac/tier_small/${level}.svg`)
      .then((r) => r.text())
      .then((svg) => svg.replaceAll(/[가-힣]/g, '')));
  const svg = await satori(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Pretendard',
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          fontSize: 64,
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {icon && (
          <>
            <img
              src={`data:image/svg+xml,${icon}`}
              height="72"
              style={{
                lineHeight: 72,
                verticalAlign: 'middle',
              }}
            />{' '}
          </>
        )}
        <span>{id}</span>
      </div>
      <img
        src={`data:image/png;base64,${Buffer.from(titlePng).toString('base64')}`}
        {...size}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Pretendard',
          data: pretendardRegular,
          weight: 400,
        },
        {
          name: 'Pretendard',
          data: pretendardBold,
          weight: 600,
        },
      ],
      embedFont: true,
    },
  );
  return new Resvg(svg, {
    imageRendering: 1,
  })
    .render()
    .asPng();
}
