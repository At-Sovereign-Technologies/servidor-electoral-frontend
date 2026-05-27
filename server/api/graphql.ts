import { proxyRequest } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    console.log('Proxying to:', config.gqlProxyTarget);
    return proxyRequest(event, config.gqlProxyTarget);
});
