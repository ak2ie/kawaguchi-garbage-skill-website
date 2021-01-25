import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import * as VueCookies from "vue-cookies";
import store from "@/store";

Vue.use(VueCookies.default);
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue")
  },
  {
    path: "/logout",
    name: "Logout",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Logout.vue")
  },
  {
    path: "/user",
    name: "UserHome",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/UserHome.vue"),
    meta: { requireAuth: true },
  },
  {
    path: "/logining",
    name: "Logining",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Logining.vue"),
    props: (route) => ({ authCode: route.query.uid })
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

/**
 * 閲覧制限
 */
router.beforeEach((to, from, next) => {
  // 閲覧時のログイン要否
  const isMemberOnly = to.matched.some((record) => record.meta.requireAuth);

  if (isMemberOnly) {
    // 認証必要ページ
    if (store.getters.isLogined) {
      // ログイン中
      next();
    } else {
      // 未ログインの場合はログインページへ遷移
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
    }

  } else {
    // ログイン不要ページ
    next();
  }
});

export default router;
