import { createRouter, createWebHistory } from "vue-router";

// Import View
import LandingView from "../views/LandingView.vue"; // <--- Import Landing View
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import HomeView from "../views/dashboard/HomeView.vue";
import AntreanView from "../views/dashboard/AntreanView.vue";
import RSTerdekatView from "../views/dashboard/RSTerdekatView.vue";
import InboxView from "../views/dashboard/InboxView.vue";
import NotifikasiView from "../views/dashboard/NotifikasiView.vue";
import PengaturanView from "../views/dashboard/PengaturanView.vue";
import AdminQueueView from "../views/dashboard/AdminQueueView.vue";
import ActivationView from "../views/auth/ActivationView.vue";
import ForgotPasswordView from "../views/auth/ForgotPasswordView.vue";
import ResetPasswordView from "../views/auth/ResetPasswordView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingView, // <--- Ubah ini! Dulu redirect ke login, sekarang ke LandingView
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: HomeView,
    },
    {
      path: "/antrean", // <-- Link url
      name: "antrean",
      component: AntreanView,
    },
    {
      path: "/rs-terdekat",
      name: "rs-terdekat",
      component: RSTerdekatView,
    },
    {
      path: "/inbox",
      name: "inbox",
      component: InboxView,
    },
    {
      path: "/notifikasi",
      name: "notifikasi",
      component: NotifikasiView,
    },
    {
      path: "/pengaturan",
      name: "pengaturan",
      component: PengaturanView,
    },
    {
      path: "/admin/antrean",
      name: "admin-antrean",
      component: AdminQueueView,
      meta: { requiresAuth: true },
    },
    {
      path: "/activate-account",
      name: "activate-account",
      component: ActivationView,
    },
    { path: "/forgot-password", component: ForgotPasswordView },
    { path: "/reset-password", component: ResetPasswordView },
  ],
});

export default router;
