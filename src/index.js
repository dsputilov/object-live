import Dispatcher from './Dispatcher.js';
import inum from "inum";
import {setPropertyByPath} from "objectutils-propertybypath";

const ObjectLive = (() => {
	let ProxyHandler = class ProxyHandler {
		constructor(owner, name) {
			this.owner = owner;
			this.name = name;
		}

		set(obj, p, newValue) {
			//console.log(`%c[ObjectLive] set[${this.name}]:`, 'background:green;', this, obj, p, newValue);
			let extra;
			if (newValue && newValue['_RP_MODEL_']) {
				extra = newValue.extra;
				newValue = newValue.value;
			}
			newValue = this.setRecursive(p, newValue);
			let oldValue = obj[p];
			let fullPath = (this.name + '.' + p).substr(11);
			this.owner.dispatchEvent('set', fullPath, {
				oldValue: oldValue,
				newValue: newValue,
				path: fullPath,
				extra: extra
			});
			obj[p] = newValue;
			//console.log('[ObjectLive] set new Value:', newValue, 'old:', oldValue);
			if (newValue !== oldValue) {
				this.owner.dispatchEvent('change', fullPath, {
					oldValue: oldValue,
					newValue: newValue,
					path: fullPath,
					extra: extra
				});
			}
			return true;
		}

		get(o, p) {
			//console.log('[ObjectLive] get:', o, p);
			return o[p];
		}

		deleteProperty(o, p) {
			//console.log('delete', p);
			return delete o[p];
		}

		setRecursive(p, v) {
			//console.log('[ObjectLive] set recursive');
			//check for falsy values
			if (v && v.constructor) {
				if (v.constructor === Object) {
					v = Object.keys(v).reduce((pp, cc) => {
						pp[cc] = this.setRecursive(p + '.' + cc, v[cc]);
						return pp;
					}, {});
					v = new Proxy(v, new ProxyHandler(this.owner, this.name + '.' + p));
				} else if (v.constructor === Array) {
					v = v.map((vv, vk) => this.setRecursive(p + '.' + vk, vv));
					['push', 'pop', 'shift', 'unshift', 'sort'].forEach(m => {
						v[m] = data => {
							//console.log(m, data);
							return Array.prototype[m].call(v, data);
						};
					});
					v = new Proxy(v, new ProxyHandler(this.owner, this.name + '.' + p));
				}
			}
			return v;
		}
	};

	return class ObjectLive {
		#listeners = {};
		#value;

		constructor(obj) {
			this.#value = new Proxy({}, new ProxyHandler(this, 'start'));
			Object.assign(this.#value, {root: obj || {}});
		}

		get data() {
			return this.#value.root;
		}

		set data(obj) {
			this.#value.root = obj;
		}

		addEventListener(eventName, mask, handler) {
			//console.warn('addEventListener:', mask, eventName);
			if (!this.#listeners[eventName]) {
				this.#listeners[eventName] = new Dispatcher();
			}
			this.#listeners[eventName].set(mask, handler);
		}

		dispatchEvent(eventName, path, v) {
			//console.log('dispatchEvent:', eventName, 'path:', path, this.#listeners[eventName]);
			if (this.#listeners[eventName]) {
				let listeners = this.#listeners[eventName].get(path);
				Object.values(listeners).forEach(cfg => {
					cfg.value(v, path);
				});
			}
		}

		bridgeChanges(path, remoteObj, remotePath) {
			let changeId = inum();
			//console.log('%c[ObjectLive] Bridged:', 'background:magenta;', this, path, remoteObj, remotePath);

			//if changed our object we will change remote
			this.addEventListener('change', new RegExp('^' + path + '(' + (path ? '\.' :'' ) + '.*)?'), cfg => {
				if (cfg.extra && cfg.extra.initiator === changeId) {
					return;
				}
				const relativePath = cfg.path.replace(new RegExp('^' + path), '');
				const newPath = remotePath + (path ? '' : '.') + relativePath;
				//console.log('[ObjectLive] our change, set remote:', cfg);
				setPropertyByPath(remoteObj.data, newPath, {
					_RP_MODEL_: true,
					value: cfg.newValue,
					extra: {initiator: changeId}
				});
			});

			//if changed remote object we will change our
			remoteObj.addEventListener('change', new RegExp('^' + remotePath + '(' + (path ? '\.' :'' ) + '.*)?'), cfg => {
				if (cfg.extra && cfg.extra.initiator === changeId) {
					return;
				}
				const relativePath = cfg.path.replace(new RegExp('^' + remotePath), '');
				const newPath = path + (remotePath ? '' : '.') + relativePath;
				//console.log('[ObjectLive] remote change, set our:', cfg);
				setPropertyByPath(this.data, newPath, {
					_RP_MODEL_: true,
					value: cfg.newValue,
					extra: {initiator: changeId}
				});
			});
		}
	};
})();

export default ObjectLive;
