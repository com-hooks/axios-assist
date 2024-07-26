import {
    CInternalAxiosRequestConfig,
} from '../types';

/**
 * 获取AbortController
 * @returns 
 */
export function useAbortSignal() {
    const controller = new AbortController();
    const signal = controller.signal;
    return {
        controller,
        signal,
        abort: () => controller.abort(),
    }
}

/**
 * 获取一个Map key
 * @param config 
 * @returns 
 */
export function getMapKey(config: CInternalAxiosRequestConfig) {
    return `${config.baseURL}${config.url}_${config.method}`;
}
