import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import Notifications from '@kyvg/vue3-notification'
 
const app = createApp(App);
const pinia = createPinia();

app.use(pinia)
    .use(Notifications)
.use(router)
    .mount('#app')
