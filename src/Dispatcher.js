const Dispatcher = class {
	#listeners = [];

	/**
	 * @param mask	{String}
	 * @return {*[]}
	 */
	get(mask) {
		let result = [];
		this.#listeners.forEach(({path, handler}) => {
			if (
				(typeof path === 'string' && mask === path) ||
				(path instanceof RegExp && path.test(mask))
			) {
				result.push({path: mask, value: handler});
			}
		});
		return result;
	}

	/**
	 * @param path		{String||RegExp}
	 * @param handler	{Function}
	 */
	set(path, handler) {
		//console.log('this.#listeners:', this.#listeners);
		this.#listeners.push({path: path, handler: handler});
	}
};

export default Dispatcher;
