
import { CAxiosResponse, CAxiosInstance, RefreshTokenRequest } from "../types";

export const defineConfig = {
    isRefresh: () => true,
    refreshRequestCount: 1,
}

export type DefineConfig = {
    /**
     * 发送请求的实例
     */
    request: CAxiosInstance,
    /**
     * 刷新token的请求
     */
    refreshRequest: RefreshTokenRequest,
    /**
     * 判断是否刷新token
     * @param resp 
     * @returns 
     */
    isRefresh?: (resp: CAxiosResponse) => boolean;
    /**
     * 运行刷新token的次数
     */
    refreshRequestCount?: number;
};