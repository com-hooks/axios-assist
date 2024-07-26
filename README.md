# axios 节流 无感刷新 AbortController signal 无感刷新token cancelToken assist
## 如何在根本解决重复提交请求
## 如何在根本上解决输入框行为结束后发送请求获取争取的数据

## example code
- 你可以使用 `defineAbortSignalThrottle`;

```ts
import axios, { CreateAxiosDefaults } from 'axios';
import {
    defineAbortSignalThrottle,
    defineRefreshToken,
    type CAxiosInstance,
    type CAxiosResponse,
    type CInternalAxiosRequestConfig
} from 'axios-assist';

export function defineXhrRequest(axiosDefaults: CreateAxiosDefaults = {}) {
    const instance = axios.create(Object.assign({
        timeout: 10000,
    }, axiosDefaults)) as CAxiosInstance;

    /**
     * 定义一个终止器
     * @params mcq 最大的并发数量
     * @params 
     */
    const { abortSignalSetup } = defineAbortSignalThrottle({ mcq: 1 });
    // 设置终止器
    abortSignalSetup(instance);

    // 添加请求拦截器
    instance.interceptors.request.use(function (config: CInternalAxiosRequestConfig) {
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    // 添加响应拦截器
    instance.interceptors.response.use(function (response: CAxiosResponse) {
           // silent 静默
        if (response?.config?.silent) {
            return Promise.resolve(response);
        }
        return Promise.resolve(response?.data);
    }, function (error) {
        return Promise.reject(error);
    });
    return instance;
}

```
- 精细控制
```ts
export function testHttp(params = {}) {
    const abortC = new AbortController();
    return xhrRequest.get('/xxxxx', {
       
        params: params,
        /**
        * 自定义终止器
        * 默认undefined 
        * @default undefined;
        */
        signal: abortC.signal,
         /**
        * 自定义添加控制接口是否静默
        * 默认undefined 不静默、根据具体逻辑弹出提示
        * @default undefined;
        */
        silent: true,
        /**
         * 自定义添加控制接口请求是否节流
         * 默认undefined 开启节流
         * @default undefined;
        */
        throttle: true,
        /**
         * 最大的并发数量
         * @default undefined;
         */
        maxConcurrentQueryCount: 1, // 最大的并发请求次数
    });
}
```

## 无感刷新token
- 你可以使用 `defineRefreshToken`;

```ts
import axios, { CreateAxiosDefaults } from 'axios';
import {
    defineRefreshToken,
    type CAxiosInstance,
    type CAxiosResponse,
    type CInternalAxiosRequestConfig
} from 'axios-assist';

export function defineXhrRequest(axiosDefaults: CreateAxiosDefaults = {}) {

    const instance = axios.create(Object.assign({
        timeout: 10000,
    }, axiosDefaults)) as CAxiosInstance;;

    const { refreshTokenSetup } = defineRefreshToken({
        refreshRequestCount: 1, // 允许 refresh request count
        request: instance,
        refreshRequest: async () => {
            const resp: any = await async () => {
                // 在这里处理获取最新token
                return true;
            };
            if (resp) {
                // 返回通过即开始重新发送待刷新的请求
                return Promise.resolve(true);
            }
            return Promise.reject(false);
        },
        isRefresh: (response) => {
            // 这里控制是否刷新token
            return response?.status === 401 || response?.data?.code === 401;
        },
    });

    /**
     * 注册刷新token器
     * @param instance 请求的实例、选传，不传即共用 defineRefreshToken 传入的 request
     */
    refreshTokenSetup(instance);

    // 添加响应拦截器
    instance.interceptors.response.use(function (response: CAxiosResponse) {
        // 使用了刷新token 并且刷新失败 refreshRequestCount为 0
        if (!response.config?.refreshRequestCount) {
           alert('登录授权失效、重新登录后重试');
        }
        return Promise.resolve(response?.data);
    }, function (error) {
        return Promise.reject(error);
    });
    return instance;
}

```

- 精细控制
```ts
export function testHttp(params = {}) {
    const abortC = new AbortController();
    return xhrRequest.get('/xxxxx', {
        params: params,
        /**
        * 刷新token 的次数
        * 默认undefined 
        * @default undefined;
        */
        refreshRequestCount: 1,
    });
}
```