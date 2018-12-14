import {assign} from 'lodash';
import Vue from 'vue'
import Vuex from 'vuex'
import pathify from 'vuex-pathify'

Vue.use(Vuex);

export default class Store {

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
    const options = Store.mergeVuexStoreOptions(
      {plugins: [pathify.plugin]},
      state
    );

    this.vuexStore = new Vuex.Store(options);
  }
}

