
import { AxiosInstance } from 'axios';
import {
    OnRefreshValue,
    CInternalAxiosRequestConfig,
    CAxiosInstance,
    CAxiosResponse,
} from '../types';
import {
    defineConfig,
    DefineConfig,
} from './const';
import {
    getMapKey,
} from './assist';



export function defineRefreshToken(config: DefineConfig) {
    const { refreshRequest, request, isRefresh, refreshRequestCount } = Object.assign(defineConfig, config);
    let refreshing = false;
    /**
     * 等待刷新请求的映射列表
     */
    let onRefreshReqMap = new Map<string, OnRefreshValue>();
    /**
     * 刷新请求的次数的映射列表
     */
    let onRefreshReqCount = new Map<string, number>();

    /**
     * 
     * @param key 
     * @returns 
     */
    function _getCurrontRefreshCount(key: string) {
        if (onRefreshReqCount.has(key)) {
            return onRefreshReqCount.get(key)!;
        }
        return 0;
    }
    function trackRefreshRequestConfig(config: CInternalAxiosRequestConfig) {
        return new Promise<CAxiosResponse>((resolve, reject) => {
            const key = getMapKey(config);
            const cb = () => request(config).then(resolve).catch(reject)
            onRefreshReqMap.set(key, cb);
            if (onRefreshReqCount.has(key)) {
                onRefreshReqCount.set(key, _getCurrontRefreshCount(key) + 1);
            } else {
                onRefreshReqCount.set(key, 1);
            }
        });
    }
    async function startRefreshServer() {
        if (!refreshing) {
            refreshing = true;
            // 请求刷新token
            try {
                await refreshRequest();
            } catch (err) {
                window.console.error(err);
            };

            Promise.resolve().then(() => {
                refreshing = false;
            });
        }
        const refreshReqList = [...onRefreshReqMap.entries()];
        refreshReqList.forEach(async item => {
            // 重新执行该request
            try {
                await item[1]?.();
            } catch (err) {
                window.console.log(err);
            } finally {
                // 请求完成从map中删除当前请求
                onRefreshReqMap.delete(item[0]);
            }
        });

    }

    /**
     *  refreshRequestCount or refreshRequestCount 次数设置为大于0 && isRefresh() === true 开启无感刷新 且判断是否开启刷新token
     * @param config 
     * @returns 
     */
    function _isRefresh(response: CAxiosResponse) {
        /**
         * config 配置的运行刷新的次数
         */
        const targetRefreshCount = response.config.refreshRequestCount ?? 0;
        /**
         * 当前已刷新过的历史次数
         */
        const currentRefreshCount = _getCurrontRefreshCount(getMapKey(response.config));
        /**
         * 是否已经到最大刷新阀值
         */
        const isBottleneck = currentRefreshCount >= targetRefreshCount && currentRefreshCount >= refreshRequestCount;
        /**
         * 允许refreshToken的次数
         */
        const refreshResolveCount = targetRefreshCount > 0 || refreshRequestCount > 0;
        return !isBottleneck && refreshResolveCount && isRefresh(response)
    }

    /**
     * 删除对应记录
     * @param response 
     */
    function _deleteRefreshRequestMap(response: CAxiosResponse) {
        const maps = [onRefreshReqMap, onRefreshReqCount]
        maps.forEach((map) => {
            const key = getMapKey(response.config);
            if (map.has(key)) {
                map.delete(key);
            }
        });
    }

    /**
     * 设置刷新token器
     * @param instance 
     * @param plugins 
     */
    function refreshTokenSetup(instance: CAxiosInstance | AxiosInstance = request, plugins?: ((data: CAxiosInstance) => void)[]) {
        function useRefreshToken(response: CAxiosResponse, err?: any) {
            if (_isRefresh(response)) {
                startRefreshServer();
                window.console.warn(`执行刷新token请求`);
                return trackRefreshRequestConfig(response.config);
            } else {
                // 删除当前请求记录数
                _deleteRefreshRequestMap(response);
            }
            if (err) {
                return Promise.reject(err);
            }
            return Promise.resolve(response);
        }
        // 添加响应拦截器
        instance.interceptors.response.use(function (response: CAxiosResponse) {
            return useRefreshToken(response);
        }, (error) => {
            return useRefreshToken(error.response, error);
        });
        // 应用所有插件
        plugins?.forEach?.(p => {
            if (typeof p !== 'function') return;
            p(instance);
        });
        return instance;
    }

    return {
        refreshing,
        onRefreshReqMap,
        onRefreshReqCount,
        refreshTokenSetup,
    }
}

