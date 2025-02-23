import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/RegisterView.vue';
import LogInView from '../views/LogInView.vue';
import EmailConfirmationView from '../views/EmailConfirmationView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import HomeView from '../views/HomeView.vue';
import RedirectHandler from '../views/RedirectHandler.vue';

import { useAuthStore } from '../store/auth';


const routes = [
  { path: '/register', component: RegisterView },
  { path: '/login', component: LogInView },
  { path: '/confirm-registration', component: EmailConfirmationView },
  { path: '/user-profile', component: UserProfileView, meta: { requiresAuth: true } },
  { path: '/', component: HomeView },
  { path: '/:shortCode', component: RedirectHandler }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router;
