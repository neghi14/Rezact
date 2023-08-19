import { render } from "src/lib/rezact/rezact";
import { TrieRouter } from "src/lib/rezact/rezact-router";

const app = document.getElementById("app");

const router = new TrieRouter({
  render: async (page, params) => {
    const mod = await page;
    app.innerHTML = "";
    if (mod.Layout) {
      // this will likely work but the fact that we completely clear the
      // app.innerHTML above means the entire layout will rerender
      // need to look at "caching" the current layout, checking if the new layout is the same
      // using a signal to store the actual mod.Page || mod.default render
      // and just assigninging the new "Page" to that Signal
      // then only the "children" of the Layout will update as long as the new Layout
      // is the same as the current Layout
      render(app, (props) => mod.Layout(props), {
        Component: mod.Page || mod.default,
        pageProps: {
          routeParams: params,
        },
      });
    } else {
      render(app, mod.Page || mod.default, { routeParams: params });
    }
  },
});

router.addRoute("/", () => import("src/components/HelloWorld"));
router.addRoute("/mdx", () => import("src/components/Test.mdx"));
router.addRoute(
  "/post/:id/something/:test",
  () => import("src/examples/RouteWithPathParams/index")
);

export { router };
