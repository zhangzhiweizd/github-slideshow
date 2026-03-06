// src/types.ts
// 定义服务器状态枚举
export type ServeStatus = 'ONLINE'|'OFFLINE'|'MAINTENANCE';

// 定义服务器对象接口
export interface ServerNode {
    id: number;
    name: string;
    ip: string;
    status: ServeStatus;
    cpuUsage: number;
    lastCheckTime: string;
    message?: string; // 可选择字段
}

// 定义api响应接口
export interface ApiResponse{
    code: number;
    data: ServerNode[];
    timestamp: number;
}