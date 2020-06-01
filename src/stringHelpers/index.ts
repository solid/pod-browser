export function parseUrl(url: string): Record<string, string> {
  const a = document.createElement("a");
  a.href = url;

  return {
    hash: a.hash,
    host: a.host,
    hostname: a.hostname,
    origin: a.origin,
    pathname: a.pathname,
    port: a.port,
    protocol: a.protocol,
    search: a.search,
  };
}

export default { parseUrl };
