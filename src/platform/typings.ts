export enum PlatformType {
	WECHAT = 'wechat',
	ALIPAY = 'alipay',
}

export interface SystemConfig {
	/**
	 * A function used to override the `window.fetch` function.
	 */
	fetchFunc: Function;
	/**
	 * TensorFlow.js exported root object.
	 */
	// tslint:disable-next-line:no-any
	tf: any;
	/**
	 * TensorFlow.js webgl backend object.
	 */
	// tslint:disable-next-line:no-any
	webgl: any;
	/**
	 * The WeChat offline canvas, can be created by calling
	 * wx.createOfflineCanvas()
	 */
	// tslint:disable-next-line:no-any
	canvas: any;
	/**
	 * Optional name of wechat webgl backend.
	 */
	// tslint:disable-next-line:no-any
	backendName?: string;
}
