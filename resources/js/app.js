require('./bootstrap');

window.Vue = require('vue');

// Buefy
let Buefy = require('buefy');
Vue.use(Buefy);

Vue.component('app', require('./components/App.vue').default);

const app = new Vue({
    el: '#app',
});