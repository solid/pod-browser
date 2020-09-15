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
import { ldp } from "rdf-namespaces";
import {
  chain,
  changeThing,
  createResponder,
  defineDataset,
  defineThing,
  displayTypes,
  getIriPath,
  getTypeName,
  isContainerIri,
  namespace,
  normalizeDataset,
  vocabularyLabel,
} from "./utils";

const TIMESTAMP = new Date(Date.UTC(2020, 5, 2, 15, 59, 21));

function createDataset(url, type = "http://www.w3.org/ns/ldp#BasicContainer") {
  const {
    addUrl,
    createSolidDataset,
    createThing,
    setDatetime,
    setDecimal,
    setInteger,
    setThing,
  } = solidClientFns;
  let publicContainer = createThing({ url });

  publicContainer = addUrl(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    type
  );

  publicContainer = addUrl(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "http://www.w3.org/ns/ldp#Container"
  );

  publicContainer = setDatetime(
    publicContainer,
    "http://purl.org/dc/terms/modified",
    TIMESTAMP
  );

  publicContainer = addUrl(
    publicContainer,
    "http://www.w3.org/ns/ldp#contains",
    "https://user.dev.inrupt.net/public/games/"
  );

  publicContainer = setDecimal(
    publicContainer,
    "http://www.w3.org/ns/posix/stat#mtime",
    1591131561.195
  );

  publicContainer = setInteger(
    publicContainer,
    "http://www.w3.org/ns/posix/stat#size",
    4096
  );

  return setThing(createSolidDataset(), publicContainer);
}

describe("changeThing", () => {
  test("it takes a thing and reduces it with an arbitrary list of operations", () => {
    const { createThing } = solidClientFns;
    const op1 = jest.fn((x) => x);
    const op2 = jest.fn((x) => x);
    const thing = createThing({ name: "this" });

    changeThing(thing, op1, op2);

    expect(op1).toHaveBeenCalledWith(thing);
    expect(op2).toHaveBeenCalledWith(thing);
  });
});

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
    const types = displayTypes([]);
    expect(types).toHaveLength(0);
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

describe("normalizeDataset", () => {
  test("it returns a normalized dataset", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createDataset(containerIri);
    const { iri, types, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
    expect(mtime).toEqual(1591131561.195);
    expect(modified).toEqual(new Date(Date.UTC(2020, 5, 2, 15, 59, 21)));
    expect(size).toEqual(4096);
    expect(contains).toContain("https://user.dev.inrupt.net/public/games/");
  });

  test("it uses full type if no human-friendly name found", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createDataset(
      containerIri,
      "http://www.w3.org/ns/ldp#UnknownType"
    );
    const { types } = normalizeDataset(litDataset, containerIri);

    expect(types).toContain("http://www.w3.org/ns/ldp#UnknownType");
    expect(types).toContain("Container");
  });
});

describe("vocabularyLabel", () => {
  test("it returns the 'label' portion of the url", () => {
    expect(vocabularyLabel("https://example.com/vocab#label")).toEqual("label");
  });

  test("it returns the 'label' in camel case if necessary", () => {
    expect(
      vocabularyLabel("https://example.com/vocab#camel-case-label")
    ).toEqual("camelCaseLabel");
  });

  test("it returns the full url if there's no 'label'", () => {
    expect(vocabularyLabel("https://example.com/vocab")).toEqual(
      "https://example.com/vocab"
    );
  });
});
