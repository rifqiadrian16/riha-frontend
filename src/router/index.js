import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("../views/LandingView.vue"), 
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/auth/RegisterView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/dashboard/HomeView.vue"),
    },
    {
      path: "/antrean", 
      name: "antrean",
      component: () => import("../views/dashboard/AntreanView.vue"),
    },
    {
      path: "/rs-terdekat",
      name: "rs-terdekat",
      component: () => import("../views/dashboard/RSTerdekatView.vue"),
    },
    {
      path: "/inbox",
      name: "inbox",
      component: () => import("../views/dashboard/InboxView.vue"),
    },
    {
      path: "/notifikasi",
      name: "notifikasi",
      component: () => import("../views/dashboard/NotifikasiView.vue"),
    },
    {
      path: "/pengaturan",
      name: "pengaturan",
      component: () => import("../views/dashboard/PengaturanView.vue"),
    },
    {
      path: "/admin/antrean",
      name: "admin-antrean",
      component: () => import("../views/dashboard/AdminQueueView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/activate-account",
      name: "activate-account",
      component: () => import("../views/auth/ActivationView.vue"),
    },
    { path: "/forgot-password", component: () => import("../views/auth/ForgotPasswordView.vue") },
    { path: "/reset-password", component: () => import("../views/auth/ResetPasswordView.vue") },
  ],
});

export default router;