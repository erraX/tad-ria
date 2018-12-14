/**
 * @file constants initializer
 * @author niminjie
 */

import {includes, map, each, extend} from 'lodash';

const VL_LABEL_MAP_SUFFIX = '_LABELMAP';
const VL_MAP_SUFFIX = '_MAP';
const VL_DATALIST_SUFFIX = '_DATALIST';

/**
 *
 * Constants
 *
 * Input:
 * {
 *    EXAMPLE: [
 *       {l: '选项1', value: 1},
 *       {l: '选项2', value: 2}
 *    ],
 * }
 *
 * Oupout:
 *
 * {
 *    EXAMPLE: [
 *       {l: '选项1', v: 1},
 *       {l: '选项2', v: 2}
 *    ],
 *
 *    EXAMPLE_MAP: {
 *        '1': 选项1
 *        '2': 选项2
 *    },
 *
 *    EXAMPLE_LABELMAP: {
 *        '选项1': 1
 *        '选项2': 2
 *    },
 *
 *    EXAMPLE_DATALIST: [
 *       {label: '选项1', value: 1},
 *       {label: '选项2', value: 2}
 *    ]
 * }
 *
 * @class
 */
export default class Constants {

    /**
     * Inner mapping
     *
     * @type {Object}
     * @private
     */
    _map = {};

    /**
     * 转换常量
     *
     * @param val
     * @param key
     * @private
     */
    _handleVL(val, key) {
        // 每组元素都包含 `v`、`l` 进行转换
        if (
            Array.isArray(val)
            && !includes(map(val, 'v'), undefined)
            && !includes(map(val, 'l'), undefined)
        ) {
            let vlMap = this._map[key + VL_MAP_SUFFIX] = {};
            let vlLabelMap = this._map[key + VL_LABEL_MAP_SUFFIX] = {};
            let vlDatalist = this._map[key + VL_DATALIST_SUFFIX] = [];

            each(val, ({v, l}) => {
                vlMap[v] = l;
                vlLabelMap[l] = v;
                vlDatalist.push({value: v, label: l});
            });
        }
    }

    /**
     * 获取指定 key 的常量
     *
     * @public
     * @param {string} key key
     */
    get(key) {
        return this.map[key];
    }

    /**
     * 设置指定 key 的常量
     *
     * @public
     * @param {string} key key
     * @param {*} value value
     */
    set(key, value) {
        this.map[key] = value;
        this._handleVL(value, key);
    }

    /**
     * 移除指定 key 的常量
     *
     * @public
     * @param {string} key key
     */
    remove(key) {
        delete this.map[key];
    }

    /**
     * 移除指定 key 的常量 map
     *
     * @public
     * @param {string} key key
     * @return {Object}
     */
    getMap(key) {
        return this.map[key + VL_MAP_SUFFIX];
    }

    /**
     * 移除指定 key 的常量 map
     *
     * @public
     * @param {string} key key
     * @return {Object}
     */
    getLabelMap(key) {
        return this.map[key + VL_LABEL_MAP_SUFFIX];
    }

    /**
     * 获取指定 key 的数据源
     *
     * @public
     * @param {string} key key
     * @return {Array<{label: string; value: string | number}>}
     */
    getDatasource(key) {
        return this.map[key + VL_DATALIST_SUFFIX];
    }

    /**
     * 初始化常量
     *
     * @public
     * @param constants
     */
    init(constants) {
        extend(this._map, constants);
        each(this._map, (...args) => this._handleVL(...args));
    }
}
