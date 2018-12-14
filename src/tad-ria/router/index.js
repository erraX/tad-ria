import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default class Router {

    router;

    getRouter() {
        return this.router;
    }

    init(routes) {
        this.router = new VueRouter({routes});
    }
}
