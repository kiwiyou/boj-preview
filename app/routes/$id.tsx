import { LoaderFunctionArgs, MetaFunction, json } from "@vercel/remix";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const solvedData = await fetch(
    `https://solved.ac/api/v3/problem/show?problemId=${params.id}`
  );
  if (!solvedData.ok) throw new Response("Not Found", { status: 404 });
  const solvedJson: any = await solvedData.json();
  const level =
    solvedJson.level === 0 && solvedJson.isLevelLocked
      ? "nr"
      : solvedJson.level;
  return json({
    origin: new URL(request.url).origin,
    id: params.id,
    title: solvedJson.titleKo,
    level,
  });
}

export const meta: MetaFunction<typeof loader> = ({ location, data }) => {
  const title = `${data?.id}번: ${data?.title}`;
  return [
    {
      httpEquiv: "refresh",
      content: `0; url=https://acmicpc.net/problem/${data?.id}`,
    },
    {
      title,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:image",
      content: new URL(
        `/${data?.id}/${data?.title}/${data?.level}.png`,
        data?.origin
      ).toString(),
    },
  ];
};

export default function Problem() {
  return <></>;
}
