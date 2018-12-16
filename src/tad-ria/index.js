/**
 * 入口文件
 *
 * @file tad-ria
 * @author niminjie(minjieni@tencent.com)
 */

import {each} from 'lodash';
import Vue from 'vue';
import AppView from './views/AppView';
import Enum from './utils/Enum';
import Router from './router';
import Store from './store';
import Constants from './Constants';
import Api from './api';

/**
 * Ria Class
 *
 * > How to use ?
 *
 * ================================================
 *
 * // Override some properties
 * class MyTadRia extends TadRia {
 *     containerId = '#app';
 *
 *     routes = [
 *         {path: '/500', component: '500'},
 *     ];
 *
 *     api = {
 *         getUser: 'GET|/get/user',
 *         getAuth: 'POST|/get/auth',
 *     };
 *
 *     // ...
 * }
 *
 * // Just Start it
 * new MyTadRia().init();
 *
 * ================================================
 *
 * @class
 */
export default class TadRia {

    AppView = AppView;

    /**
     * 路由类
     *
     * @type {Router}
     */
    Router = Router;

    /**
     * 常量类
     *
     * @type {Constants}
     */
    Constants = Constants;

    /**
     * Store类
     *
     * @type {Store}
     */
    Store = Store;

    /**
     * Api类
     *
     * @type {Api}
     */
    Api = Api;

    /**
     * Vue渲染容器ID
     *
     * @type {string}
     */
    containerId = '#app';

    /**
     * 路由定义
     *
     * @type {{path: string, component: Vue}[]}
     */
    routes = [];

    /**
     * Vuex store 定义
     *
     * @type {Object}
     */
    state = {};

    /**
     * 常量定义
     *
     * @type {Object}
     */
    constants = {};

    /**
     * 整个系统钩子函数
     *
     * @type {Object}
     */
    hooks = {
        api: {}
    };

    /**
     * API定义
     *
     * @type {Object}
     */
    api = {};

    /**
     * Axios 配置
     *
     * @type {Object}
     */
    apiConfigs = {
        baseURL: '/',
        timeout: 5000
    };

    /**
     * 自定义全局指令
     *
     * @type {Object}
     */
    directives = {};

    /**
     * 自定义全局过滤器
     *
     * @type {Object}
     */
    filters = {};

    /**
     * 自定义全局Mixin
     *
     * @type {Object}
     */
    mixins = {};

    /**
     * Vue app instance
     *
     * @type {Vue}
     */
    $vm;

    /**
     * Before init hook
     */
    beforeInit() {}

    /**
     * Before init hook
     */
    afterInit() {}

    // TODO: 每个init函数后面都加 `before`, `after` 钩子

    /**
     * 初始化
     */
    init() {
        this.beforeInit();
        this.initConstants();
        this.initStore();
        this.initRouter();
        this.initApi();
        this.initVue();
        this.afterInit();

        return this;
    }

    /**
     * 初始化API
     */
    initApi() {
        const api = new this.Api().init(this.apiConfigs, this.hooks.api, this.store.getStore());
        each(this.api, (val, key) => this.api[key] = api.create(key, val));
    }

    /**
     * 初始化vuex
     */
    initStore() {
        this.store = new Store();
        this.store.init(this.state);
    }

    /**
     * 初始化常量
     */
    initConstants() {
        const rawConstants = this.constants;
        this.constants = new this.Constants();
        this.constants.init(rawConstants);
    }

    /**
     * 初始化路由
     */
    initRouter() {
        this.router = new this.Router();
        this.router.init(this.routes);
    }

    /**
     * 初始化Vue
     */
    initVue() {
        // 注册 mixin、filter、directive
        each(this.mixins, val => Vue.mixin(val));
        each(this.filters, (val, key) => Vue.filter(key, val));
        each(this.directives, (val, key) => Vue.directive(key, val));

        // 初始化Vue
        const AppView = this.AppView;
        this.$vm = new Vue({
            el: this.containerId,
            router: this.router.getRouter(),
            store: this.store.getStore(),
            template: '<app-view/>',
            components: {AppView}
        });
    }
}

// Re-export some libs
export {
    Enum,
    AppView,
    Router,
    Store,
    Constants,
    Api
}
