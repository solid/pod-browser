import { parseUrl } from "./index";

describe("parseUrl", () => {
  test("it parses a given url into parts", () => {
    const {
      hash,
      host,
      hostname,
      origin,
      pathname,
      port,
      protocol,
      search,
    } = parseUrl("https://example.com:1000/path?query=param#hash");

    expect(hash).toEqual("#hash");
    expect(host).toEqual("example.com:1000");
    expect(hostname).toEqual("example.com");
    expect(origin).toEqual("https://example.com:1000");
    expect(pathname).toEqual("/path");
    expect(port).toEqual("1000");
    expect(protocol).toEqual("https:");
    expect(search).toEqual("?query=param");
  });

  test("it gracefully handles non-urls", () => {
    const {
      hash,
      host,
      hostname,
      origin,
      pathname,
      port,
      protocol,
      search,
    } = parseUrl("not a url");

    expect(hash).toEqual("");
    expect(host).toEqual("localhost");
    expect(hostname).toEqual("localhost");
    expect(origin).toEqual("http://localhost");
    expect(pathname).toEqual("/not%20a%20url");
    expect(port).toEqual("");
    expect(protocol).toEqual("http:");
    expect(search).toEqual("");
  });
});
