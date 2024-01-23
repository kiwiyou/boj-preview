import { LoaderFunctionArgs, MetaFunction, json } from '@vercel/remix';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const tier = new URL(request.url).searchParams.get('tier');
  const solvedData = await fetch(
    `https://solved.ac/api/v3/problem/show?problemId=${params.id}`
  );
  if (!solvedData.ok) throw new Response('Not Found', { status: 404 });
  const solvedJson: any = await solvedData.json();
  const level =
    tier &&
    (solvedJson.level === 0 && solvedJson.isLevelLocked
      ? 'nr'
      : solvedJson.level);
  return json({
    origin: new URL(request.url).origin,
    id: params.id,
    title: solvedJson.titleKo,
    level,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = `${data?.id}번: ${data?.title}`;
  const url = `https://acmicpc.net/problem/${data?.id}`;
  const og = new URL(
    data?.level
      ? `/${data?.id}/${encodeURIComponent(data?.title)}/${data?.level}.png`
      : `/${data?.id}/${encodeURIComponent(data?.title)}.png`,
    data?.origin
  ).toString();
  return [
    {
      httpEquiv: 'refresh',
      content: `0; url=${url}`,
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
