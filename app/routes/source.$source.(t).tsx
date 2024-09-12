import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@vercel/remix';
import isbot from 'isbot';

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!isbot(request.headers.get('User-Agent'))) {
    // return redirect(`https://acmicpc.net/source/${params.source}`, 301);
  }
  const bojData = await fetch(
    `https://www.acmicpc.net/status?top=${params.source}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.114/115 Safari/537.36',
      },
    },
  );
  console.log(bojData);
  if (!bojData.ok) throw new Response('Not Found', { status: 404 });
  const bojHTML = await bojData.text();
  const trBegin = bojHTML.indexOf(`solution-${params.source}`);
  if (trBegin === -1) throw new Response('Not Found', { status: 404 });
  const trEnd = bojHTML.indexOf('</tr>', trBegin);
  const { title, id } = bojHTML
    .slice(trBegin, trEnd)
    .match(/problem\/(?<id>\d+).+?title="(?<title>[^"]+)"/)!.groups!;
  const tier = request.url.endsWith('/t');
  let level;
  if (tier) {
    const solvedData = await fetch(
      `https://solved.ac/api/v3/problem/show?problemId=${id}`,
    );
    if (!solvedData.ok) throw new Response('Not Found', { status: 404 });
    const solvedJson: any = await solvedData.json();
    level =
      solvedJson.level === 0 && solvedJson.isLevelLocked
        ? 'nr'
        : (solvedJson.sprout ? 's' : '') + solvedJson.level;
  }
  return json({
    origin: new URL(request.url).origin,
    source: params.source,
    id,
    title,
    level,
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.source}번 소스`;
  const url = new URL(location.pathname, data?.origin).toString();
  const og = new URL(
    data?.level !== undefined
      ? `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title)}&level=${data?.level}`
      : `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title!)}`,
    data?.origin,
  ).toString();
  return [
    {
      title,
    },
    {
      name: 'description',
      content: '',
    },
    {
      property: 'og:url',
      content: url,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: '',
    },
    {
      property: 'og:image',
      content: og,
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'twitter:domain',
      content: 'acmicpc.net',
    },
    {
      property: 'twitter:url',
      content: url,
    },
    {
      property: 'twitter:title',
      content: title,
    },
    {
      property: 'twitter:description',
      content: '',
    },
    {
      property: 'twitter:image',
      content: og,
    },
  ];
};

export default function Problem() {
  return <></>;
}
