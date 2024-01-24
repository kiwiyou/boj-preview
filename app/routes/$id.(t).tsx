import { LoaderFunctionArgs, MetaFunction, json } from '@vercel/remix';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const tier = request.url.endsWith('/t');
  const solvedData = await fetch(
    `https://solved.ac/api/v3/problem/show?problemId=${params.id}`,
  );
  if (!solvedData.ok) throw new Response('Not Found', { status: 404 });
  const solvedJson: any = await solvedData.json();
  const level = tier
    ? solvedJson.level === 0 && solvedJson.isLevelLocked
      ? 'nr'
      : solvedJson.level
    : undefined;
  return json({
    origin: new URL(request.url).origin,
    id: params.id,
    title: solvedJson.titleKo,
    level,
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.id}번: ${encodeURIComponent(data?.title)}`;
  const url = new URL(location.pathname, data?.origin).toString();
  const og = new URL(
    data?.level !== undefined
      ? `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title)}&level=${data?.level}`
      : `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title)}`,
    data?.origin,
  ).toString();
  return [
    {
      httpEquiv: 'refresh',
      content: `0; url=https://acmicpc.net/problem/${data?.id}`,
    },
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
