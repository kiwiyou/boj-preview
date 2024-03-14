import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from '@vercel/remix';
import isbot from 'isbot';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const tier = request.url.endsWith('/t');
  const query = (params.query as string).replaceAll('=', ' ');
  const solvedData = await fetch(
    `https://solved.ac/api/v3/search/problem?query=${encodeURIComponent(query)}`,
  );
  if (!solvedData.ok) throw new Response('Not Found', { status: 404 });
  const solvedJson: any = await solvedData.json();
  if (solvedJson.count === 0) throw new Response('Not Found', { status: 404 });
  const problem = solvedJson.items[0];
  const level = tier
    ? problem.level === 0 && problem.isLevelLocked
      ? 'nr'
      : (solvedJson.sprout ? 's' : '') + problem.level
    : undefined;
  if (!isbot(request.headers.get('User-Agent'))) {
    return redirect(`https://acmicpc.net/problem/${problem.problemId}`, 301);
  }
  return json({
    origin: new URL(request.url).origin,
    id: problem.problemId,
    title: problem.titleKo,
    level,
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.id}번: ${data?.title}`;
  const url = new URL(location.pathname, data?.origin).toString();
  const og = new URL(
    data?.level !== undefined
      ? `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title)}&level=${data?.level}`
      : `/og.png?id=${data?.id}&title=${encodeURIComponent(data?.title)}`,
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
