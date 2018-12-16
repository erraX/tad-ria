import {assign} from 'lodash';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default class Store {

    storeProps = {
        state: {
            loadingCount: 0
        },
        mutations: {
            startLoading(state) {
                state.loadingCount++;
            },
            endLoading(state) {
                const loadingCount = state.loadingCount;
                state.loadingCount = loadingCount <= 0 ? 0 : loadingCount - 1;
            }
        },
        getters: {
            isLoading({loadingCount}) {
                return loadingCount > 0;
            }
        }
    };

    static mergeVuexStoreOptions(to, from) {
        if (to.plugins) {
            [].push.apply(to.plugins, from.plugins || []);
        }

        assign(to.state, from.state);
        assign(to.mutation, from.mutation);
        assign(to.actions, from.actions);
        assign(to.getters, from.getters);
    }

    vuexStore;

    getStore() {
        return this.vuexStore;
    }

    init(state) {
        this.vuexStore = new Vuex.Store({
            ...this.storeProps,
            ...state
        });
    }
}
