import {
    CInternalAxiosRequestConfig,
} from '../types';


/**
 * 获取一个Map key
 * @param config 
 * @returns 
 */
export function getMapKey(config: CInternalAxiosRequestConfig) {
    return `${config.baseURL}${config.url}_${config.method}`;
}
