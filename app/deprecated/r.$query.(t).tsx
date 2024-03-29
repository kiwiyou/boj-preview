import { kv } from '@vercel/kv';
import {
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@vercel/remix';
import isbot from 'isbot';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const tier = request.url.endsWith('/t');
  const query = (params.query as string).replaceAll('=', ' ');
  let p = await kv.get<{ id: number; title: string; level: string | number }>(
    query,
  );
  if (!p) {
    const solvedData = await fetch(
      `https://solved.ac/api/v3/search/problem?query=${encodeURIComponent(query)}&sort=random`,
    );
    if (!solvedData.ok) throw new Response('Not Found', { status: 404 });
    const solvedJson: any = await solvedData.json();
    if (solvedJson.count === 0)
      throw new Response('Not Found', { status: 404 });
    const problem = solvedJson.items[0];
    const level = tier
      ? problem.level === 0 && problem.isLevelLocked
        ? 'nr'
        : problem.level
      : undefined;
    p = {
      id: problem.problemId,
      title: problem.titleKo,
      level,
    };
    await kv.set(query, JSON.stringify(p));
    await kv.expire(query, 60 * 60 * 24);
  }
  if (!isbot(request.headers.get('User-Agent'))) {
    return redirect(`https://acmicpc.net/problem/${p.id}`);
  }
  return json({
    origin: new URL(request.url).origin,
    ...p,
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.id}번: ${data?.title}`;
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
