/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as solidClientFns from "@inrupt/solid-client";
import {
  addUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import { ldp, rdf } from "rdf-namespaces";
import {
  chain,
  chainPromise,
  createResponder,
  datasetIsContainer,
  defineDataset,
  defineThing,
  displayTypes,
  getIriPath,
  getTypeName,
  getTypes,
  isContainerIri,
  isPodOwner,
  namespace,
  serializePromises,
  sharedStart,
  uniqueObjects,
} from "./utils";

describe("createResponder", () => {
  test("it returns a function to respond with a data or with an error message", () => {
    const { respond, error } = createResponder();

    expect(respond("data")).toMatchObject({ response: "data" });
    expect(error("message")).toMatchObject({ error: "message" });
  });
});

describe("chain", () => {
  test("it reduces an arbitrary list of functions, accumulating each operation's return product", () => {
    const opOne = jest.fn((x) => [x, "one"].join(":"));
    const opTwo = jest.fn((x) => [x, "two"].join(":"));
    const value = chain("x", opOne, opTwo);

    expect(opOne).toHaveBeenCalledWith("x");
    expect(opTwo).toHaveBeenCalledWith("x:one");
    expect(value).toEqual("x:one:two");
  });
});

describe("chainPromise", () => {
  it("supports chaining with promises", async () => {
    expect(
      await chainPromise(
        Promise.resolve(42),
        async (a) => Promise.resolve(a + 1),
        (a) => a + 1
      )
    ).toBe(44);

    expect(
      await chainPromise(
        1337,
        (a) => a + 1,
        async (a) => a + 1
      )
    ).toBe(1339);
  });
});

describe("defineDataset", () => {
  test("it creates a new dataset with an arbitrary list of setter functions", () => {
    const opOne = jest.fn((x) => [x, "one"].join(":"));
    const opTwo = jest.fn((x) => [x, "two"].join(":"));

    jest.spyOn(solidClientFns, "createThing").mockReturnValueOnce("thing");
    jest
      .spyOn(solidClientFns, "setThing")
      .mockImplementationOnce(jest.fn((x) => x));
    jest
      .spyOn(solidClientFns, "createSolidDataset")
      .mockReturnValueOnce("dataset");

    const thing = defineDataset({ name: "this" }, opOne, opTwo);

    expect(opOne).toHaveBeenCalledWith("thing");
    expect(opTwo).toHaveBeenCalledWith("thing:one");
    expect(thing).toEqual("dataset");
  });
});

describe("defineThing", () => {
  test("it creates a new thing with an arbitrary list of setter functions", () => {
    const opOne = jest.fn((x) => [x, "one"].join(":"));
    const opTwo = jest.fn((x) => [x, "two"].join(":"));

    jest.spyOn(solidClientFns, "createThing").mockReturnValueOnce("thing");

    const thing = defineThing({ name: "this" }, opOne, opTwo);

    expect(opOne).toHaveBeenCalledWith("thing");
    expect(opTwo).toHaveBeenCalledWith("thing:one");
    expect(thing).toEqual("thing:one:two");
  });

  test("it correctly applies options when creating a thing", () => {
    const url = "https://www.example.org/";
    const mockThing = mockThingFrom(url);

    const thing = defineThing({ url });
    const thingUrl = solidClientFns.asUrl(thing);
    const mockThingUrl = solidClientFns.asUrl(mockThing);

    expect(thingUrl).toEqual(mockThingUrl);
  });
});

describe("displayTypes", () => {
  test("it returns a list of the human-friendly type names", () => {
    const types = displayTypes([
      "http://www.w3.org/ns/ldp#BasicContainer",
      "http://www.w3.org/ns/ldp#Container",
    ]);

    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
  });

  test("it returns an empty Array if types are empty", () => {
    expect(displayTypes([])).toHaveLength(0);
  });

  test("it returns an empty array if types are not a list", () => {
    expect(displayTypes(null)).toHaveLength(0);
  });
});

describe("getIriPath", () => {
  test("it extracts the pathname from the iri", () => {
    const path1 = getIriPath("https://user.dev.inrupt.net/public/");
    const path2 = getIriPath(
      "https://user.dev.inrupt.net/public/games/tictactoe/data.ttl"
    );

    expect(path1).toEqual("/public");
    expect(path2).toEqual("/public/games/tictactoe/data.ttl");
  });
});

describe("getTypeName", () => {
  test("it returns the type display name", () => {
    Object.keys(ldp).forEach((key) => {
      expect(getTypeName(ldp[key])).toEqual(key);
    });
  });

  test("it returns the raw type when given an invalid type", () => {
    expect(getTypeName("invalid")).toEqual("invalid");
  });

  test("it returns an empty string if given a falsey value", () => {
    expect(getTypeName(undefined)).toEqual("");
  });
});

describe("isContainerIri", () => {
  test("it returns false when given undefined", () => {
    expect(isContainerIri()).toBe(false);
  });

  test("it returns true when the iri ends in /", () => {
    expect(isContainerIri("https://user.dev.inrupt.net/public/")).toEqual(true);
  });

  test("it returns false when the iri ends in /", () => {
    expect(isContainerIri("https://user.dev.inrupt.net/public")).toEqual(false);
  });
});

describe("namespace", () => {
  test("it reflects all the keys and values", () => {
    Object.keys(namespace).forEach((key) => {
      const value = namespace[key];
      expect(value).not.toBeUndefined();
      expect(namespace[value]).toEqual(key);
    });
  });

  test("it contains all the definitions in ldp", () => {
    Object.keys(ldp).forEach((key) => {
      const value = namespace[key];
      const expectedValue = ldp[key];

      expect(value).toEqual(expectedValue);
    });
  });
});

const iri = "http://example.com/resource";
const type1 = "http://example.com/Type1";
const type2 = "http://example.com/Type2";
const containerType = "http://example.com/Container";

describe("getTypes", () => {
  it("returns a list of types based on rdf:type", () => {
    const thing = chain(
      mockThingFrom(iri),
      (t) => addUrl(t, rdf.type, type1),
      (t) => addUrl(t, rdf.type, type2)
    );
    const dataset = chain(mockSolidDatasetFrom(iri), (t) => setThing(t, thing));
    expect(getTypes(dataset)).toEqual([type1, type2]);
  });

  it("returns an empty list if dataset does not have resource info", () => {
    expect(getTypes({})).toEqual([]);
  });
});

describe("datasetIsContainer", () => {
  it("checks whether or not dataset is a container", () => {
    const thing1 = chain(mockThingFrom(iri), (t) =>
      addUrl(t, rdf.type, containerType)
    );
    const dataset1 = chain(mockSolidDatasetFrom(iri), (t) =>
      setThing(t, thing1)
    );
    expect(datasetIsContainer(dataset1)).toBeTruthy();

    const thing2 = chain(mockThingFrom(iri), (t) => addUrl(t, rdf.type, type1));
    const dataset2 = chain(mockSolidDatasetFrom(iri), (t) =>
      setThing(t, thing2)
    );
    expect(datasetIsContainer(dataset2)).toBeFalsy();
  });
});

describe("sharedStart", () => {
  it("gets the matching characters from the start of strings", () => {
    expect(sharedStart("bar", "baz")).toEqual("ba");
    expect(sharedStart("foo", "bar")).toEqual("");
    expect(sharedStart("bar", "baz", "bam")).toEqual("ba");
    expect(sharedStart(undefined, "baz")).toEqual("");
    expect(sharedStart(undefined, undefined)).toEqual("");
  });
});

describe("serializePromises", () => {
  const asyncFn = async (str) => {
    return new Promise((resolve) => resolve(str));
  };
  it("takes an array of promise factories and resolves them sequentially", async () => {
    const strings = ["example1", "example2", "example3"];
    const promiseFactories = strings.map((str) => () => asyncFn(str));
    serializePromises(promiseFactories);
    await expect(promiseFactories[0]()).resolves.toBe("example1");
    await expect(promiseFactories[1]()).resolves.toBe("example2");
    await expect(promiseFactories[2]()).resolves.toBe("example3");
  });
});

describe("uniqueObjects", () => {
  test("it returns a unique set of objects", () => {
    const one = { one: "one" };
    const two = { two: "two" };
    const duplicate = { two: "two" };
    const list = [one, two, duplicate];
    const uniqueList = uniqueObjects(list);

    expect(uniqueList).toHaveLength(2);
    expect(uniqueList[0]).toMatchObject(one);
    expect(uniqueList[1]).toMatchObject(two);
  });
});

describe("isPodOwner", () => {
  it("returns true if the given id is the same as the agent of the given session", () => {
    const webId = "webId";
    const session = { info: { webId } };

    expect(isPodOwner(session, webId)).toBe(true);
  });

  it("returns false if the given id is not the same as the agent of the given session", () => {
    const webId = "webId";
    const otherId = "otherId";
    const session = { info: { webId } };

    expect(isPodOwner(session, otherId)).toBe(false);
  });
});
