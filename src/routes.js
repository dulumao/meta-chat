export const routes = [
  {
    name: 'home',
    path: "/",
    component: () => import("./views/Home.vue"),
    meta: { title: "Home" },
  },
  {
    name: 'app',
    path: "/app",
    meta: { title: "Meta-Chat", requiresAuth: true },
    component: () => import("./views/Chat.vue"),
  },
  {
    name: 'metamask',
    path: "/metamask",
    meta: { title: "metamask"},
    component: () => import("./views/meta.vue"),
  },
  {
    name: 'connect',
    path: "/connect",
    meta: { title: "Chat",requirelogout: true  },
    component: () => import("./views/Connect.vue"),
  },
  {
    name: 'notFound',
    path: "/:path(.*)",
    meta: { title: "404" },
    component: () => import("./views/NotFound.vue"),
  },
];
