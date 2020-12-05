import Message from "../chat/components/Message";

import { SealText, SealUserTimeout } from './const';

/** 用户是否被封禁 */
let isSeal = false;

export default function fetch<T = any>(event: string, data = {}, {
    toast = true,
} = {}): Promise<[string, T]> {
    if (isSeal) {
        Message.error(SealText);
        // @ts-ignore
        return Promise.resolve([SealText, null]);
    }
    return new Promise((resolve) => {
        import('src/chat/socket').then(socket => {
            socket.default().emit(event, data, (res: string | T) => {
                if (typeof res === 'string') {
                    if (toast) {
                        Message.error(res);
                    }
                    /**
                     * 服务端返回封禁状态后, 本地存储该状态
                     * 用户再触发接口请求时, 直接拒绝
                     */
                    if (res === SealText) {
                        isSeal = true;
                        // 用户封禁和ip封禁时效不同, 这里用的短时间
                        setTimeout(() => { isSeal = false; }, SealUserTimeout);
                    }
                    // @ts-ignore
                    resolve([res, null]);
                } else {
                    // @ts-ignore
                    resolve([null, res]);
                }
            });
        })
        
    });
}
