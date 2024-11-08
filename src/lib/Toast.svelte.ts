import { getContext, onDestroy, setContext } from "svelte";

export interface Toast {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';

}



class ToastState {
    toasts = $state<Toast[]>([]);
    toastToTimeoutMap = new Map<string, NodeJS.Timeout>();

    constructor() {
        // cleanup timeouts on destroy
        onDestroy(() => {
            for (const timeout of this.toastToTimeoutMap.values()) {
                clearTimeout(timeout)
            }
        })
    }

    add(title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', durationMs = 5000) {
        const id = crypto.randomUUID()

        this.toasts.push({ id, title, message, type })

        // remove toast after durationMs 
        this.toastToTimeoutMap.set(id, setTimeout(() => {
            this.remove(id)
        }, durationMs))

    }

    remove(id: string) {
        const timeout = this.toastToTimeoutMap.get(id)
        if (timeout) {
            clearTimeout(timeout)
            this.toastToTimeoutMap.delete(id)
        }
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
    }
}

const TOAST_KEY = Symbol('toastkey')

export function setToastState() {
    return setContext(TOAST_KEY, new ToastState())
}

export function getToastState() {
    return getContext<ReturnType<typeof setToastState>>(TOAST_KEY)
}