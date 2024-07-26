import { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios';


export interface CAxiosRequestConfig<D = any> extends AxiosRequestConfig<D> {
    /**
     * 自定义添加控制接口请求是否节流
     * 默认undefined 开启节流
     * @default undefined;
    */
    throttle?: boolean;
    /**
    * 自定义添加控制接口是否静默
    * 默认undefined 不静默、根据具体逻辑弹出提示
    * @default undefined;
    */
    silent?: boolean;
    /**
     * 刷新token次数
     */
    refreshRequestCount?: number;
    /**
     * 最大的并发数量
     */
    maxConcurrentQueryCount?: number;
}
export interface InternalAxiosRequestConfig<D = any> extends CAxiosRequestConfig<D> {
    headers: AxiosRequestHeaders;
}

export interface CAxiosResponse<T = any, D = any> extends AxiosResponse<T, D> {
    config: InternalAxiosRequestConfig;
}


export type OnRefreshValue = () => Promise<void>;
export type RefreshTokenRequest = () => Promise<unknown>;
export type RefreshRequest = (config: CInternalAxiosRequestConfig) => Promise<CAxiosResponse>;

export interface CInternalAxiosRequestConfig extends InternalAxiosRequestConfig {

}
export interface CAxiosInstance extends AxiosInstance {
    interceptors: {
        request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
        response: AxiosInterceptorManager<CAxiosResponse>;
    };
    getUri(config?: CAxiosRequestConfig): string;
    request<T = any, R = CAxiosResponse<T>, D = any>(config: CAxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = CAxiosResponse<T>, D = any>(url: string, config?: CAxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = CAxiosResponse<T>, D = any>(url: string, config?: CAxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = CAxiosResponse<T>, D = any>(url: string, config?: CAxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = CAxiosResponse<T>, D = any>(url: string, config?: CAxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
    postForm<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
    putForm<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
    patchForm<T = any, R = CAxiosResponse<T>, D = any>(url: string, data?: D, config?: CAxiosRequestConfig<D>): Promise<R>;
}