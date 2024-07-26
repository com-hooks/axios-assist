

export const defineConfig = {
    /**
     * 最大并发数量
     */
    maxConcurrentQueryCount: 1,
}

export type DefineConfig = {
     /**
     * 最大并发数量
     */
     maxConcurrentQueryCount?: number;
};