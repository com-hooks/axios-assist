import { AxiosInstance } from 'axios';
import {
    CInternalAxiosRequestConfig,
    CAxiosInstance,
    CAxiosResponse,
} from '../types';
import {
    useAbortSignal,
    getMapKey,
} from './assist';
import {
    defineConfig,
    DefineConfig,
} from './const';

/**
 * 定义节流请求
 * @returns 
 */
export function defineAbortSignalThrottle(config: DefineConfig = {}) {
    const _defineConfig = Object.assign(defineConfig, config);

    /**
     * 终止器存储
     */
    const abortControllerMap = new Map<string, AbortController>();
    /**
     * 最大并发对象次数记录
     */
    const targetMcqMap = new Map<string, number>();

    function batchMapDelete(key: string) {
        const deleteMaps = [abortControllerMap, targetMcqMap]
        deleteMaps.forEach(map => {
            if (map.has(key)) {
                map.delete(key);
            }
        });
    }

    function throttleAbortSignal(config: CInternalAxiosRequestConfig) {
        const key = getMapKey(config);
        const { isBottleneck } = requestCount(key, config);
        if (abortControllerMap.has(key) && isBottleneck) {
            const controller = abortControllerMap.get(key);
            controller!.abort();
        }
        const { controller, abort, signal } = useAbortSignal()
        abortControllerMap.set(key, controller);
        const sourceSignal = config?.signal;
        if (sourceSignal) {
            sourceSignal?.addEventListener?.('abort', abort)
        }
        config.signal = signal;
        abortControllerMap.set(key, controller);
        return {
            config,
            abort: () => abort,
        }
    }

    function requestCount(_key: string, config: CInternalAxiosRequestConfig) {
        let isBottleneck = false;
        if (targetMcqMap.has(_key)) {
            const currentCount = targetMcqMap.get(_key)!;
            let isMaxConcurrentQuery = currentCount >= _defineConfig.maxConcurrentQueryCount;
            let targetMcqCount = config.maxConcurrentQueryCount;
            if(typeof targetMcqCount === 'number') {
                // 自身有定义则使用自身的 maxConcurrentQueryCount;
                isMaxConcurrentQuery = currentCount >= targetMcqCount;
            }
            if (isMaxConcurrentQuery) {
                window.console.warn(`请求 ${_key} 并发了${currentCount} 已超出并发数 ${_defineConfig.maxConcurrentQueryCount} 已自动终止超出请求 可配置参数maxConcurrentQueryCount调整并发数量`);
                isBottleneck = true;
                targetMcqMap.delete(_key);
            }
            targetMcqMap.set(_key, currentCount + 1);
        } else {
            targetMcqMap.set(_key, 1);
        }
        return {
            isBottleneck,
        }
    }

    /**
     * 销毁终止信号
     * @param config 
     */
    function destroyAbortSignal(config: CInternalAxiosRequestConfig) {
        const key = getMapKey(config);
        batchMapDelete(key);
    }

    /**
     * 设置终止器
     * @param instance 
     * @param plugins 
     */
    function abortSignalSetup(instance: CAxiosInstance | AxiosInstance, plugins?: ((data: CAxiosInstance) => void)[]) {
        instance.interceptors.request.use(function (config: CInternalAxiosRequestConfig) {
            // throttle 没有设置 获取设置为true 开启节流
            if (config.throttle === void 0 || config.throttle) {
                throttleAbortSignal(config);
            }
            return config;
        });
        // 添加响应拦截器
        instance.interceptors.response.use(function (response: CAxiosResponse) {
            destroyAbortSignal(response.config);
            return Promise.resolve(response);

        }, function (error) {
            destroyAbortSignal(error?.response?.config || error?.config || {});
            return Promise.reject(error);
        });
        // 应用所有插件
        plugins?.forEach?.(p => {
            if (typeof p !== 'function') return;
            p(instance);
        });
        return instance;
    }

    return {
        throttleAbortSignal,
        destroyAbortSignal,
        abortSignalSetup,
    }
}
