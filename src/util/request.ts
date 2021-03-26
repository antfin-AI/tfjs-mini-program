/**
 * 小程序的request请求promise化
 */
export async function fetch_alipay(url: string, requestInits: { [key: string]: any }): Promise<any> {
  const params = { ...requestInits };
  const defaultParams = {
    method: 'GET',
    dataType: 'text',
  };

  const needArrayBuffer =
    params.dataType === 'arraybuffer'
    || !!url.split('?')[0].endsWith('.bin')
    || !!url.split('?')[0].endsWith('.wasm');

  if (needArrayBuffer) params.dataType = 'arraybuffer';
  const resParams = { ...defaultParams, ...params };

  return new Promise((resolve, reject) => {
    my.request({
      ...resParams,
      success(res: MyRequestResponse) {
        const { status } = res;
        let data: any;
        if (needArrayBuffer) {
          data = res.data;
        } else {
          data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        }

        resolve({
          ok: ((res.status / 200) | 0) === 1,
          status,
          json: () => Promise.resolve(data),
          arrayBuffer: () => Promise.resolve(data),
        });
      },
      fail(err: object) {
        reject(err);
      },
    });
  });
}
