import { LoaderFunctionArgs, redirect } from '@vercel/remix';

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect(request.url.replace('/s/', '/source/'), 301);
}
