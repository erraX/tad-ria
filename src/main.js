import TadRia from './tad-ria';
import AppView from './App'
import {
  routes,
  state,
  constants,
  api,
  apiHooks
} from './configs';

/**
 * MyRia
 *
 * @extends TadRia
 */
class MyRia extends TadRia {

  /**
   * AppPView
   *
   * @override
   */
  AppView = AppView;

  /**
   * 路由
   *
   * @override
   */
  routes = routes;

  /**
   * Vuex store
   *
   * @override
   */
  state = state;

  /**
   * 常量
   *
   * @override
   */
  constants = constants;

  /**
   * API
   *
   * @override
   */
  api = api;

  /**
   * Hooks
   *
   * @override
   */
  hooks = {
    api: apiHooks
  };
}

const ria = new MyRia().init();
window.ria = ria;

async function fetch() {
    let ret;
    try {
        ret = await ria.api.getUser({name: 123})
    }
    catch (ex) {
        console.log(ex);
    }
    finally {
        console.log('ret', ret);
    }
}

fetch();

export default ria;
