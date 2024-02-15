import juice from 'juice';
import satori, { Font } from 'satori';
import parseHTML from 'html-react-parser';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { cloneElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function loadFont(url: string) {
  return fetch(url).then((r) => r.arrayBuffer());
}

function changeSpace(
  element: string | JSX.Element | JSX.Element[],
): string | JSX.Element | JSX.Element[] {
  if (typeof element === 'string') {
    return element.replace(/^ | $/g, '\u00A0');
  }
  if (element instanceof Array) {
    return element.map(changeSpace) as JSX.Element[];
  }
  if (element.props.children) {
    return cloneElement(
      element,
      {},
      ...[element.props.children].flat().map(changeSpace),
    );
  }
  return element;
}

function hrefToBase64(element: string | JSX.Element): string | JSX.Element {
  if (typeof element === 'string') {
    return element;
  }
  if (
    element.type === 'image' &&
    element.props.href.startsWith('data:image/svg+xml;utf8,')
  ) {
    return cloneElement(element, {
      href:
        'data:image/svg+xml;base64,' +
        btoa(
          decodeURIComponent(
            element.props.href
              .slice('data:image/svg+xml;utf8,'.length)
              .replace(/ /g, '%20'),
          ),
        ),
    });
  }
  if (element.props.children) {
    return cloneElement(
      element,
      {},
      ...[element.props.children].flat().map(hrefToBase64),
    );
  }
  return element;
}

function expandHref(element: string | JSX.Element): string | JSX.Element {
  if (typeof element === 'string') {
    return element;
  }
  if (element.type === 'image') {
    let expanded;
    if (element.props.href.startsWith('data:image/svg+xml;utf8,')) {
      expanded = decodeURIComponent(
        element.props.href
          .slice('data:image/svg+xml;utf8,'.length)
          .replace(/ /g, '%20'),
      );
    } else {
      expanded = atob(
        element.props.href.slice('data:image/svg+xml;base64,'.length),
      );
    }
    const nested = parseHTML(expanded) as JSX.Element;
    const c = nested.props.children
      ? [nested.props.children].flat().map(expandHref)
      : undefined;
    return cloneElement(
      nested,
      {
        ...element.props,
        ...nested.props,
        mask: '',
        style: {
          overflow: 'visible',
        },
      },
      c,
    );
  }
  if (element.props.children) {
    return cloneElement(
      element,
      {},
      [element.props.children].flat().map(expandHref),
    );
  }
  return element;
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
  const interLatinBold = await loadFont(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff',
  );
  const interLatinExtBold = await loadFont(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-ext-600-normal.woff',
  );
  const interBoldItalic = await loadFont(
    'https://kiwiyou.github.io/boj-preview/public/Inter-BoldItalic.otf',
  );
  const notoSansMonoBold = await loadFont(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-mono@latest/latin-600-normal.woff',
  );
  const notoSansCjkKrBold = await loadFont(
    'https://kiwiyou.github.io/boj-preview/public/NotoSansKR-Bold.otf',
  );
  const notoSansArabicBold = await loadFont(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-arabic@latest/arabic-600-normal.woff',
  );
  const notoSansThaiBold = await loadFont(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-thai@latest/thai-600-normal.woff',
  );
  const fonts: Font[] = [
    {
      name: 'Inter Bold',
      data: interLatinBold,
      weight: 600,
      style: 'normal',
    },
    {
      name: 'Inter Bold',
      data: interBoldItalic,
      weight: 600,
      style: 'italic',
    },
    {
      name: 'Inter Bold',
      data: interLatinExtBold,
      weight: 600,
      style: 'normal',
    },
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
    {
      name: 'Noto Sans CJK KR',
      data: notoSansCjkKrBold,
      weight: 600,
    },
    {
      name: 'Noto Sans Arabic',
      data: notoSansArabicBold,
      weight: 600,
    },
    {
      name: 'Noto Sans Thai',
      data: notoSansThaiBold,
      weight: 600,
    },
    {
      name: 'Noto Sans Mono',
      data: notoSansMonoBold,
      weight: 600,
    },
  ];

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
  let emojiTitle = title.replace('<scoring>', '&lt;scoring&gt;');
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
      ? firstRender
          .replaceAll('<em', '<em style="font-style: italic;"')
          .replaceAll('<code', `<code style="font-family: 'Noto Sans Mono';"`)
      : '&nbsp;',
  );
  const htmlTitle = changeSpace(parseHTML(styledTitle) as JSX.Element);
  let titleSvg;
  const size: Record<string, Number> = {};
  if (hasMath) {
    titleSvg = await satori(
      <div
        style={{
          display: 'flex',
          width: 1000,
          justifyContent: 'center',
          fontSize: 54,
          fontWeight: 600,
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        {htmlTitle}
      </div>,
      {
        width: 1000,
        fonts,
        embedFont: true,
      },
    );
  } else {
    const titleMultiline = await satori(
      <div
        style={{
          display: 'flex',
          width: 1000,
          fontSize: 54,
          fontWeight: 600,
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          wordBreak: 'keep-all',
        }}
      >
        {htmlTitle}
      </div>,
      {
        width: 1000,
        fonts,
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
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {htmlTitle}
      </div>,
      {
        height: 108,
        fonts,
        embedFont: true,
      },
    );
    const { width: svgWidth, height: svgHeight } = titleSingleLine.match(
      /width="(?<width>\d+)" height="(?<height>\d+)"/,
    )?.groups!;
    if (+svgWidth > 2000) {
      titleSvg = titleMultiline;
    } else {
      titleSvg = titleSingleLine;
      const width = Math.min(+svgWidth, 1000);
      size.width = width;
      size.height = (+svgHeight * width) / +svgWidth;
    }
  }
  const subSvg = cloneElement(
    hrefToBase64(parseHTML(titleSvg) as JSX.Element) as JSX.Element,
    size,
  );
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
      {subSvg}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      embedFont: true,
    },
  );
  const expanded = renderToStaticMarkup(
    expandHref(parseHTML(svg) as JSX.Element) as JSX.Element,
  );
  return new Resvg(expanded, {
    imageRendering: 1,
  })
    .render()
    .asPng();
}
