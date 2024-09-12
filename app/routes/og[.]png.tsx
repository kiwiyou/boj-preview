import type { LoaderFunctionArgs } from '@vercel/remix';
import { createProblemImage } from '~/utils/createProblemImage.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const title = decodeURIComponent(url.searchParams.get('title')!);
  const level = url.searchParams.get('level');
  if (!id || !title) {
    return new Response('Bad Request', {
      status: 400,
    });
  }
  const image = await createProblemImage(request.url, id, title, level);
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
