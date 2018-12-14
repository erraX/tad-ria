/**
 * @file 枚举
 * @author niminjie(minjieni@tencent.com)
 * @date 2018-12-10
 */

/**
 * `obj` 中是否有自身属性 `key`
 *
 * @param {Object} obj obj
 * @param {string} key key
 * @return {boolean}
 */
function has(obj, key) {
    return obj.hasOwnProperty(key);
}

/**
 * Enum
 *
 * @class
 */
export default class Enum {

    /**
     * `Enum` 构造函数
     *
     * @constructor
     * @param {...Object} entities entities
     */
    constructor(...entities) {
        this.valueIdx = [];
        this.aliasIdx = {};

        if (entities.length === 1 && Array.isArray(entities[0])) {
            entities = entities[0];
        }

        this.entities = entities || [];
        this._parseEntities(entities);
    }

    /**
     * 解析 `entities`
     *
     * @param {Array<Object>} entities entities
     */
    _parseEntities(entities = []) {
        entities.forEach(this._parseEntity, this);
    }

    /**
     * 解析 `entity`
     *
     * @param {Object} entity entity
     * @param {Object} entity.alias alias
     * @param {Object} entity.text text
     * @param {Object} entity.value value
     * @param {number} idx idx
     */
    _parseEntity(entity, idx) {
        let {
            alias,
            value,
            text
        } = entity;

        value = (value === undefined || value === null || value === '') ? idx : value;
        alias = alias || text;

        // TODO: Immutable
        entity.value = value;

        if (has(this, value)) {
            throw new Error(`Enum already has value: ${value}`);
        }

        if (has(this, alias)) {
            throw new Error(`Enum already has alias: ${alias}`);
        }

        // Assign to `this`
        this[value] = alias;
        this[alias] = value;

        // Add to index
        this.valueIdx[value] = entity;
        this.aliasIdx[alias] = entity;
    }

    /**
     * 根据 `alias` 获取 `text`
     *
     * @param {string} alias alias
     * @return {string}
     */
    getTextFromAlias(alias) {
        const e = this.aliasIdx[alias];
        return e && (e.text || e.alias);
    }

    /**
     * 根据 `value` 获取 `text`
     *
     * @param {string} value value
     * @return {string}
     */
    getTextFromValue(value) {
        const e = this.valueIdx[value];
        return e && (e.text || e.alias);
    }

    /**
     * to value array
     *
     * @return {Array}
     */
    toArray() {
        return this.entities.map(e => e.value);
    }

    /**
     * to select,radio,checkbox option array
     *
     * @return {Array}
     */
    toOptions() {
        return this.entities.map(e => ({value: e.value, text: e.text}));
    }
}
