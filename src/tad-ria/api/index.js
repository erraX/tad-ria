import axios from 'axios';
import {isFunction, isString} from 'lodash';
import hookable from  '../decorators/hookable';

/**
 * 生成错误对象
 *
 * @param {string} message 错误提示信息
 * @return {Object} 错误对象
 */
function getRequestErrorObj(message) {
    return {
        message,
        success: false
    };
}

/**
 * Api生成器
 *
 * @class
 */
@hookable({
    AFTER_CREATE_AXIOS: 'afterCreateAxios',
    AFTER_CREATE_API: 'afterCreateApi',
    BEFORE_REQUEST: 'beforeRequest',
    AFTER_FAILURE: 'afterFailure',
    AFTER_RESPONSE: 'afterResponse',
    AFTER_SUCCESS: 'afterSuccess',
    AFTER_COMPLETE: 'afterComplete'
})
export default class Api {

    /**
     * Api hooks
     *
     * @type {Object}
     */
    // static HOOKS = {
    //     AFTER_CREATE_AXIOS: 'afterCreateAxios',
    //     AFTER_CREATE_API: 'afterCreateApi',
    //     BEFORE_REQUEST: 'beforeRequest',
    //     AFTER_FAILURE: 'afterFailure',
    //     AFTER_RESPONSE: 'afterResponse',
    //     AFTER_SUCCESS: 'afterSuccess',
    //     AFTER_COMPLETE: 'afterComplete'
    // };

    static getRequestErrorObj = getRequestErrorObj;
    static NOT_FOUND_ERROR = getRequestErrorObj('服务器接口不存在');
    static SERVER_ERROR = getRequestErrorObj('服务器错误');
    static PARSE_ERROR = getRequestErrorObj('数据解析失败');
    static SCHEMA_ERROR = getRequestErrorObj('数据格式错误');
    static UNKNOWN_ERROR = getRequestErrorObj('未知错误');
    static NETWORK_ERROR = getRequestErrorObj('网络错误');

    /**
     * 初始化
     *
     * @param {Object} configs 配置
     * @param {Object} hooks 钩子函数
     */
    init(configs, hooks) {
        this.applyHooks(hooks);
        this.axios = axios.create(configs);

        this.callHook(Api.HOOKS.AFTER_CREATE_AXIOS, this.axios);

        this.axios.interceptors.request.use(
            this.onBeforeRequest.bind(this)
        );
        this.axios.interceptors.response.use(
            this.onRequestSuccess.bind(this),
            this.onRequestFailure.bind(this)
        );

        return this;
    }

    /**
     * 判断API声明是否合法
     *
     * @param {string} declaration API 声明
     * @returns {boolean}
     */
    isApiDeclarationValid(declaration) {
        return isFunction(declaration) || isString(declaration);
    }

    /**
     * 解构API声明
     *
     * 合法：
     *  - [method]|[url]  -> 'POST|/user/name'
     *  - [url]  -> '/user/name' -> 'POST|user/name'
     *
     * @param declaration
     * @returns {string[]}
     */
    destructDeclaration(declaration) {
        let [method, url] = declaration.split('|');

        if (!url) {
            url = method;
            method = 'POST';
        }

        if (!url) {
            throw new Error(
                `Api: ${apiNamme} declaration shoulde be: '[method]|[requestUrl]', `
                + `or '[requestUrl]'`
                + ` , not ${declaration}`
            );
        }

        return [method, url];
    }

    /**
     * 请求统一处理逻辑（成功或失败）
     *
     * @param {Object} response
     * @return {Promise<Object>}
     */
    onRequestSuccess(response) {
        let data = this.normalizeAndParseResponse(response);
        data = this.callHook(Api.HOOKS.AFTER_RESPONSE, data) || data;

        // 请求错误
        // 1. Ajax错误
        // 2. Ajax成功，返回错误代码
        if (!data.success) {
            let message = data.message;
            message = this.callHook(Api.HOOKS.AFTER_FAILURE, message) || message;
            message = this.callHook(Api.HOOKS.AFTER_COMPLETE, message, data.success) || message;
            return Promise.reject(message);
        }

        // 请求成功，返回数据，进行下一步处理
        data = this.callHook(Api.HOOKS.AFTER_SUCCESS, data) || data;
        data = this.callHook(Api.HOOKS.AFTER_COMPLETE, data, data.success) || data;
        return data.result;
    }

    /**
     * 规范化请求返回结果
     *
     * @param {Object} response response
     * @return {Object}
     */
    normalizeAndParseResponse(response) {
        const {success, data = {}} = response;
        const {return_code, return_msg} = data;

        if (success !== undefined && !success) {
            return response;
        }

        // 返回错误代码
        if (parseInt(return_code, 10) !== 0) {
            return return_msg && isString(return_msg)
                ? Api.getRequestErrorObj(return_msg)
                : Api.SERVER_ERROR
        }

        // 返回成功
        return {
            success: true,
            result: return_msg
        };
    }

    /**
     * 请求失败，转换成请求成功处理
     *
     * @param {Object} result result
     * @return {Promise<Object>}
     */
    onRequestFailure(result = {}) {
        let error;
        if (result.response) {
            let status = result.response.status;

            // 服务器没有正常返回
            if (
              status < 200
              || (status >= 300 && status !== 304 && status !== 404)
            ) {
                error = Api.SERVER_ERROR;
            }
            else if (status === 404) {
                error = Api.NOT_FOUND_ERROR;
            }
            else {
                error = Api.PARSE_ERROR;
            }
        }
        else if (result.message) {
            error = Api.getRequestErrorObj(result.message);
        }
        else {
            error = Api.NETWORK_ERROR;
        }

        return this.onRequestSuccess(error);
    }

    /**
     * 发送请求之前
     *
     * @param {...any} args args
     */
    onBeforeRequest(configs) {
        return this.callHook(Api.HOOKS.BEFORE_REQUEST, configs) || configs;
    }

    /**
     * 创建请求函数
     *
     * @param {string} apiName
     * @param {string} declaration
     * @returns {Function}
     */
    create(apiName, declaration) {
        if (!this.isApiDeclarationValid(declaration)) {
            throw new Error(
                `Api: ${apiName} shoulde be a Function or String. It probs be ${typeof declaration}`
            );
        }

        // 自己定义的函数，不用再处理了
        if (isFunction(declaration)) return declaration;

        // 'GET|/user/get'
        let [method, url] = this.destructDeclaration(declaration);

        let apiFn = async (data, configs = {}) => await this.axios({
            method,
            url,
            data,
            ...configs
        });
        apiFn = this.callHook(Api.HOOKS.AFTER_CREATE_API, apiFn) || apiFn;
        return apiFn;
    }
}
