/**
 * Class representing a window manager.
 */
class WindowManager {
	#windows;
	#count;
	#id;
	#winData;
	#winShapeChangeCallback;
	#winChangeCallback;

	/**
	 * Create a window manager instance.
	 */
	constructor() {
		let that = this;

		// event listener for when localStorage is changed from another window
		addEventListener("storage", (event) => {
			if (event.key == "windows") {
				let newWindows = JSON.parse(event.newValue);
				let winChange = that.#didWindowsChange(that.#windows, newWindows);

				that.#windows = newWindows;

				if (winChange) {
					if (that.#winChangeCallback) that.#winChangeCallback();
				}
			}
		});

		// event listener for when current window is about to be closed
		window.addEventListener('beforeunload', function (e) {
			let index = that.getWindowIndexFromId(that.#id);

			// remove this window from the list and update local storage
			that.#windows.splice(index, 1);
			that.updateWindowsLocalStorage();
		});
	}

	/**
	 * Check if there are any changes to the window list.
	 * @private
	 * @param {Array} pWins - The previous window list.
	 * @param {Array} nWins - The new window list.
	 * @returns {boolean} - True if there are changes, false otherwise.
	 */
	#didWindowsChange(pWins, nWins) {
		if (pWins.length != nWins.length) {
			return true;
		} else {
			let c = false;

			for (let i = 0; i < pWins.length; i++) {
				if (pWins[i].id != nWins[i].id) c = true;
			}

			return c;
		}
	}

	/**
	 * Initialize the current window.
	 * @param {Object} metaData - The metadata to store with each window instance.
	 */
	init(metaData) {
		this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
		this.#count = localStorage.getItem("count") || 0;
		this.#count++;

		this.#id = this.#count;
		let shape = this.getWinShape();
		this.#winData = { id: this.#id, shape: shape, metaData: metaData };
		this.#windows.push(this.#winData);

		localStorage.setItem("count", this.#count);
		this.updateWindowsLocalStorage();
	}

	/**
	 * Get the shape of the window.
	 * @returns {Object} - The shape of the window.
	 */
	getWinShape() {
		let shape = { x: window.screenLeft, y: window.screenTop, w: window.innerWidth, h: window.innerHeight };
		return shape;
	}

	/**
	 * Get the index of the window from its ID.
	 * @param {number} id - The ID of the window.
	 * @returns {number} - The index of the window.
	 */
	getWindowIndexFromId(id) {
		let index = -1;

		for (let i = 0; i < this.#windows.length; i++) {
			if (this.#windows[i].id == id) index = i;
		}

		return index;
	}

	/**
	 * Update the windows list in local storage.
	 */
	updateWindowsLocalStorage() {
		localStorage.setItem("windows", JSON.stringify(this.#windows));
	}

	/**
	 * Update the window.
	 */
	update() {
		let winShape = this.getWinShape();

		if (
			winShape.x != this.#winData.shape.x ||
			winShape.y != this.#winData.shape.y ||
			winShape.w != this.#winData.shape.w ||
			winShape.h != this.#winData.shape.h
		) {
			this.#winData.shape = winShape;

			let index = this.getWindowIndexFromId(this.#id);
			this.#windows[index].shape = winShape;

			if (this.#winShapeChangeCallback) this.#winShapeChangeCallback();
			this.updateWindowsLocalStorage();
		}
	}

	/**
	 * Set the callback function for window shape change.
	 * @param {Function} callback - The callback function.
	 */
	setWinShapeChangeCallback(callback) {
		this.#winShapeChangeCallback = callback;
	}

	/**
	 * Set the callback function for window change.
	 * @param {Function} callback - The callback function.
	 */
	setWinChangeCallback(callback) {
		this.#winChangeCallback = callback;
	}

	/**
	 * Get the windows list.
	 * @returns {Array} - The windows list.
	 */
	getWindows() {
		return this.#windows;
	}

	/**
	 * Get the data of the current window.
	 * @returns {Object} - The data of the current window.
	 */
	getThisWindowData() {
		return this.#winData;
	}

	/**
	 * Get the ID of the current window.
	 * @returns {number} - The ID of the current window.
	 */
	getThisWindowID() {
		return this.#id;
	}
}

export default WindowManager;