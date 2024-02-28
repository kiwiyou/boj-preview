import type { LoaderFunctionArgs } from '@vercel/remix';
import { createImage } from '~/utils/createProblemImage.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const image = await createImage(
    request.url,
    url.searchParams.get('id')!,
    url.searchParams.get('title')!,
    url.searchParams.get('level'),
  );
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
