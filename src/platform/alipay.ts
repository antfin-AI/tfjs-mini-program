// 设置tf运行环境
import * as tfjs from '@tensorflow/tfjs-core';
import * as webgl_backend from '@tensorflow/tfjs-backend-webgl';
import { MiniProgramTFJSPlatform } from '.';

export let fetchFunc: Function;

export class PlatformAlipay implements MiniProgramTFJSPlatform {
	constructor(fetchFunc: Function) {
		fetchFunc = fetchFunc;
	}
	fetch(path: string, requestInits?: RequestInit): Promise<Response> {
		return fetchFunc(path, requestInits);
	}
	now(): number {
		return Date.now();
	}
	encode: any;
	decode: any;
}

export const ALIPAY_WEBGL_BACKEND_NAME = 'alipay-webgl';

const BACKEND_PRIORITY = 2;

export async function initWebGL(tf: typeof tfjs, canvas: HTMLCanvasElement) {
	if (tf.findBackend(ALIPAY_WEBGL_BACKEND_NAME) == null) {
		const gl = canvas.getContext('webgl', {
			alpha: false,
			antialias: false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: false,
			depth: false,
			stencil: false,
			failIfMajorPerformanceCaveat: true,
		});

		webgl_backend.setWebGLContext(1, gl);
		tf.ENV.set('WEBGL_VERSION', 1);

		await new Promise<void>((resolve, reject) => {
			try {
				tf.registerBackend(
					ALIPAY_WEBGL_BACKEND_NAME,
					() => {
						try {
							const context = new webgl_backend.GPGPUContext(gl);
							const allKernels = tf.getKernelsForBackend('webgl');

							allKernels.forEach((kernel) => {
								if (kernel) {
									tf.registerKernel({
										...tf.getKernel(kernel.kernelName, 'webgl'),
										backendName: ALIPAY_WEBGL_BACKEND_NAME,
									});

								}
							});

							return new webgl_backend.MathBackendWebGL(context);
						} catch (e) {
							console.error(e);
							return null;
						}
					},
					BACKEND_PRIORITY,
				);
				resolve();
			} catch (e) {
				reject(e);
				console.error(`Failed to register Alipay Webgl backend: ${e.message}`);
			}
		});
	}

	tf.setBackend(ALIPAY_WEBGL_BACKEND_NAME);
	console.info('current backend = ', tf.getBackend());
}

// export async function setWASM(paths?: Object) {
//   const { setWasmPaths } = tfWasm;
//   const defaultPaths = {
//     'tfjs-backend-wasm.wasm': 'https://gw.alipayobjects.com/os/bmw-prod/4e851e62-40d0-4a70-9dac-1b46841fef65.bin',
//     'tfjs-backend-wasm-simd.wasm': 'https://gw.alipayobjects.com/os/bmw-prod/53b981cf-a3e4-42eb-a297-0f83eff5ee19.bin',
//     'tfjs-backend-wasm-threaded-simd.wasm': 'https://gw.alipayobjects.com/os/bmw-prod/e3ae338b-0a39-4056-a71d-9b2388f1947f.bin'
//   };
//   const wasmPaths = { ...defaultPaths, ...(paths || {}) }
//   setWasmPaths(wasmPaths, true);
//   await tf.setBackend('wasm');
// }
