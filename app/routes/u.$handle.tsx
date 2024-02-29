import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from '@vercel/remix';
import isbot from 'isbot';

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!isbot(request.headers.get('User-Agent'))) {
    return redirect(`https://acmicpc.net/user/${params.handle}`, 301);
  }
  const og = new URL(`/user.png`, request.url);
  og.searchParams.set('handle', params.handle || '');
  return json({
    handle: params.handle || '',
    url: request.url,
    og: og.toString(),
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.handle} 정보`;
  const url = data?.url;
  const og = data?.og;
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
