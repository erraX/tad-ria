import {isArray, isFunction, isPlainObject, each} from 'lodash';

const isNullOrUndef = target => target === null || target === undefined;

/**
 * Hookable 装饰器
 *
 * @param {Object} HOOKS 钩子名称常量
 * @returns {function(*): {new(): {callHook(string, ...[any]): *}, prototype: {callHook(string, ...[any]): *}}}
 */
export default HOOKS => WrappedClass => {

    // Assign static HOOKS property
    WrappedClass.HOOKS = HOOKS;

    // `HANDLERS` private property
    const HANDLERS = Symbol('HANDLERS');

    // Enable hookable
    class HookableClass extends WrappedClass {

        /**
         * 检查是否可以挂载钩子
         *
         * const cls = new HookableClass()
         *
         * cls[Symbol.for('isHookable')] // true
         * cls['isHookable'] // undefined
         *
         * @type {boolean}
         */
        [Symbol.for('isHookable')] = true;

        /**
         * 封装调用钩子函数
         *
         * @param {string} hookName 钩子函数名
         * @param {...any} args
         */
        callHook(hookName, ...args) {
            this[HANDLERS] || (this[HANDLERS] = {});
            const handler = this[HANDLERS][hookName] || [];
            return handler.reduce(
                (ret, handler) => {
                    const nextRet = handler.apply(
                        this,
                        isNullOrUndef(ret) ? [...args] : [...args, ret]
                    );
                    return nextRet === false ? ret : nextRet;
                },
                null
            );
        }

        /**
         * 注册钩子函数
         *
         * @param {string} hookName 钩子函数名
         * @param {Function} handler 回调函数
         */
        applyHook(hookName, handler) {
            if (!hookName || !handler) {
                return;
            }

            this[HANDLERS] || (this[HANDLERS] = {});
            const handlers = this[HANDLERS][hookName] || (this[HANDLERS][hookName] = []);
            handlers.push(handler);
        }

        /**
         * 注册所有钩子函数
         *
         * @param {Object} hooks 钩子函数
         */
        applyHooks(hooks) {

            // Example:
            //
            // =======================================================
            //
            // hooks: {
            //   api(hook) {
            //       hook(Api.AFTER_CREATE_AXIOS, () => {
            //           console.log('Call hook: AFTER_CREATE_AXIOS');
            //       });
            //       hook(Api.AFTER_CREATE_API, () => {
            //           console.log('Call hook: AFTER_CREATE_API');
            //       });
            //   },
            //   ...
            // }
            //
            // =======================================================

            if (isFunction(hooks)) {
                hooks((hookName, handler) => this.applyHook(hookName, handler));
            }

            // Example:
            //
            // =======================================================
            //
            // hooks: {
            //   apiHooks: {
            //       [Api.AFTER_CREATE_AXIOS]() {
            //           console.log('Call hook: AFTER_CREATE_AXIOS');
            //       },
            //       [Api.AFTER_CREATE_API]: [
            //          () => console.log('Call hook: AFTER_CREATE_API handler1'),
            //          () => console.log('Call hook: AFTER_CREATE_API handler2')
            //       ]
            //   },
            //   ...
            // }
            //
            // =======================================================
            else if (isPlainObject(hooks)) {
                each(hooks, (handlers, hookName) => {
                    handlers = isArray(handlers) ? handlers : [handlers];
                    each(handlers, handler => this.applyHook(hookName, handler));
                });
            }
        }
    }

    return HookableClass;
}

