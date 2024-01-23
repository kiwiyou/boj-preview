import { LoaderFunctionArgs } from '@vercel/remix';
import { createImage } from '~/utils/createImage.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const image = await createImage(
    request.url,
    params.id!,
    params.title!,
    params.level!
  );
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
