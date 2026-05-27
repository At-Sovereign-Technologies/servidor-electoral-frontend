import { proxyRequest } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    return proxyRequest(event, config.gqlProxyTarget);
});
