import * as tfjs from '@tensorflow/tfjs-core';
import * as webgl_backend from '@tensorflow/tfjs-backend-webgl';
import { TextDecoder, TextEncoder } from 'text-encoder';
import { PlatformType, SystemConfig } from "./typings";
import { initWebGL as initWXWebGL, PlatformWeChat } from './wx';
import { PlatformAlipay } from './alipay';

import * as fetchWechat from 'fetch-wechat';
import { initWebGL as initAlipayWebGL } from './alipay'
import { fetch_alipay } from '../util/request';

export const WECHAT_WEBGL_BACKEND_NAME = 'wechat-webgl';
export const ALIPAY_WEBGL_BACKEND_NAME = 'alipay-webgl';

export class MimiProgramPlatform {
	private platformType: PlatformType;
	private backendName: typeof WECHAT_WEBGL_BACKEND_NAME | typeof ALIPAY_WEBGL_BACKEND_NAME;
	constructor(type: PlatformType) {
		this.platformType = type;
		this.backendName = type === PlatformType.WECHAT ? WECHAT_WEBGL_BACKEND_NAME : ALIPAY_WEBGL_BACKEND_NAME;
	}
	public setupMiniProgramPlatform(tf: any, config: SystemConfig, debug = false) {
		if (debug) {
			console.log(tf);
		}
		if (tf.getBackend() === this.backendName) {
			return;
		}
		try {
			const webgl = config.webgl as typeof webgl_backend;
			switch (this.platformType) {
				case PlatformType.WECHAT:
					tf.ENV.setPlatform(PlatformType.WECHAT, new PlatformWeChat(fetchWechat.fetchFunc));
					initWXWebGL(tf, webgl, wx.createOffscreenCanvas(), this.backendName, debug);
					break;
				case PlatformType.ALIPAY:
					tf.ENV.setPlatform(PlatformType.ALIPAY, new PlatformAlipay(fetch_alipay));
					initAlipayWebGL(tf, my._createOffscreenCanvas());
					break;
				default:
			}
			setBase64Methods(tf);
		} catch (error) {
			console.log(
				'webgl backend is not initialized, ' +
				'please check webgl backend and the offscreen canvas.');
		}
	}
}

/**
 * Polyfill btoa and atob method on the global scope which will be used by
 * model parser.
 */
export function setBase64Methods(tf: typeof tfjs) {
	tf.ENV.global.btoa = btoa;
	tf.ENV.global.atob = atob;
}

export class MiniProgramTFJSPlatform implements tfjs.Platform {
	fetchFunc?: Function;
	constructor(fetchFunc: Function) {
		if (fetchFunc) {
			this.fetchFunc = fetchFunc;
		}
	}
	fetch(path: string, requestInits?: RequestInit): Promise<Response> {
		return this?.fetchFunc(path, requestInits);
	}
	now(): number {
		return Date.now();
	}
	encode(text: string, encoding: string): Uint8Array {
		if (encoding !== 'utf-8' && encoding !== 'utf8') {
			throw new Error(
				`Browser's encoder only supports utf-8, but got ${encoding}`);
		}
		return new TextEncoder(encoding).encode(text);
	}
	decode(bytes: Uint8Array, encoding: string): string {
		return new TextDecoder(encoding).decode(bytes);
	}
}
