import { Hono } from "hono/tiny";

import { isbot } from "isbot";
import { querySingle } from "./vendor/solved";

const getPath = (req: Request) => {
	const userAgent = req.headers.get("User-Agent");
	const isBot = isbot(userAgent) ? "is-bot" : "not-bot";
	const path = req.url.replace(/^https?:\/\/[^/]+(\/[^?]*).*/, "$1");
	return `/${isBot}${path}`;
};

const app = new Hono({
	getPath,
});

app.on("GET", "/not-bot", (c) => c.redirect("https://www.acmicpc.net/", 301));
app.on("GET", ["/not-bot/:id", "/not-bot/problem/:id"], (c) =>
	c.redirect(`https://www.acmicpc.net/problem/${c.req.param("id")}`, 301),
);
app.on("GET", ["/not-bot/u/:handle", "/not-bot/user/:handle"], (c) =>
	c.redirect(`https://www.acmicpc.net/user/${c.req.param("handle")}`, 301),
);
app.on("GET", ["/not-bot/s/:id", "/not-bot/source/:id"], (c) =>
	c.redirect(`https://www.acmicpc.net/source/${c.req.param("id")}`, 301),
);
app.on("GET", ["/not-bot/q/:query", "/not-bot/query/:query"], async (c) => {
	const query = c.req.param("query");
	const problem = await querySingle(query);
	if (!problem) {
		return c.notFound();
	}
	return c.redirect(
		`https://www.acmicpc.net/problem/${problem.problemId}`,
		302,
	);
});

export default app;
