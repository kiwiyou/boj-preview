import type { LoaderFunctionArgs } from '@vercel/remix';
import { createUserImage } from '~/utils/createUserImage.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle');
  if (!handle) {
    return new Response('Bad Request', {
      status: 400,
    });
  }
  const showUserUrl = new URL('https://solved.ac/api/v3/user/show');
  showUserUrl.searchParams.set('handle', handle);
  const showUser = await fetch(showUserUrl);
  const image = await createUserImage(await showUser.json());
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
