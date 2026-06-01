import { type Config, route as routeFn } from 'ziggy-js';

export function configureZiggy(ziggy: Config): void {
    globalThis.Ziggy = ziggy;
}

export function bindRouteGlobal(): void {
    globalThis.route = routeFn;
}
