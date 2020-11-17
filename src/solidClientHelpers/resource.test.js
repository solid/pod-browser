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

import * as SolidClientFns from "@inrupt/solid-client";
import {
  asUrl,
  getSourceUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf } from "rdf-namespaces";
import createContainer from "../../__testUtils/createContainer";
import {
  getOrCreateContainer,
  getOrCreateDataset,
  getOrCreateThing,
  getResource,
  getResourceName,
  saveResource,
  deleteResource,
} from "./resource";
import { getPolicyUrl } from "./policies";
import { chain } from "./utils";

jest.mock("./policies");

describe("getResource", () => {
  test("it returns a dataset and an iri", async () => {
    const dataset = createContainer();
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(dataset);
    const iri = "https://user.example.com";
    const { response } = await getResource(iri, jest.fn());

    expect(response.iri).toEqual(iri);
    expect(response.dataset).toEqual(dataset);
  });

  test("it returns an error message when it throws an error", async () => {
    jest.spyOn(SolidClientFns, "getSolidDataset").mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const iri = "https://user.example.com";
    const { error } = await getResource(iri, jest.fn());

    expect(error).toEqual("boom");
  });
});

describe("getResourceName", () => {
  test("it returns the resource name string when given a resource pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/data.ttl");

    expect(resourceName).toEqual("data.ttl");
  });
  test("it returns the resource name string when given a container pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/");

    expect(resourceName).toEqual("tictactoe");
  });

  test("it returns the decoded resource name when spaces and special characters have been URI encoded", () => {
    const resourceName = getResourceName(
      "public/notes/Hello%20World%3AHello%40World%3BHello.txt"
    );
    expect(resourceName).toEqual("Hello World:Hello@World;Hello.txt");
  });
});

describe("getOrCreateContainer", () => {
  const iri = "http://example.com/test/";
  const fetch = "fetch";
  const existingContainer = "existingContainer";
  const newContainer = "newContainer";
  const missingError = "404";
  const cannotCreateError = "cannotCreateError";

  it("returns existing containers", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockResolvedValue(existingContainer);
    const { response } = await getOrCreateContainer(iri, fetch);
    expect(response).toBe(existingContainer);
  });

  it("creates a new container if it doesn't exist", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(missingError));
    jest
      .spyOn(SolidClientFns, "createContainerAt")
      .mockResolvedValue(newContainer);
    const { response } = await getOrCreateContainer(iri, fetch);
    expect(response).toBe(newContainer);
  });

  it("returns error if it doesn't exist and cannot be created", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(cannotCreateError));
    const { error } = await getOrCreateContainer(iri, fetch);
    expect(error).toEqual(cannotCreateError);
  });

  it("returns error if it fails to create create", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(missingError));
    jest
      .spyOn(SolidClientFns, "createContainerAt")
      .mockRejectedValue(new Error(cannotCreateError));
    const { error } = await getOrCreateContainer(iri, fetch);
    expect(error).toEqual(cannotCreateError);
  });
});

describe("getOrCreateDataset", () => {
  const iri = "http://example.com/test.ttl";
  const fetch = "fetch";
  const existingResource = "existingResource";
  const newResource = "newResource";
  const missingError = "404";
  const cannotCreateError = "cannotCreateError";

  it("returns existing resource", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockResolvedValue(existingResource);
    const { response } = await getOrCreateDataset(iri, fetch);
    expect(response).toBe(existingResource);
  });

  it("creates a new resource if it doesn't exist", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(missingError));
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue(newResource);
    const { response } = await getOrCreateDataset(iri, fetch);
    expect(response).toBe(newResource);
  });

  it("returns error if it doesn't exist and cannot be created", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(cannotCreateError));
    const { error } = await getOrCreateDataset(iri, fetch);
    expect(error).toEqual(cannotCreateError);
  });

  it("returns error if it fails to create create", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockRejectedValue(new Error(missingError));
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockRejectedValue(new Error(cannotCreateError));
    const { error } = await getOrCreateDataset(iri, fetch);
    expect(error).toEqual(cannotCreateError);
  });
});

describe("getOrCreateThing", () => {
  const existingThingIri = "http://example.com/#thing";
  const existingThing = chain(mockThingFrom(existingThingIri), (t) =>
    setUrl(t, rdf.type, "http://example.com/#Class")
  );
  const existingDatasetIri = "http://example.com/";
  const existingDataset = chain(mockSolidDatasetFrom(existingDatasetIri), (d) =>
    setThing(d, existingThing)
  );
  const newThingIri = "http://example.com/#newThing";

  it("returns existing things", () => {
    const { thing, dataset } = getOrCreateThing(
      existingDataset,
      existingThingIri
    );
    expect(thing).toEqual(existingThing);
    expect(asUrl(thing)).toEqual(existingThingIri);
    expect(getSourceUrl(dataset)).toEqual(existingDatasetIri);
  });

  it("create new thing if it doesn't exist from before", () => {
    const { thing, dataset } = getOrCreateThing(existingDataset, newThingIri);
    expect(asUrl(thing)).toEqual(newThingIri);
    expect(getSourceUrl(dataset)).toEqual(existingDatasetIri);
  });
});

describe("saveResource", () => {
  test("it saves the given resource", async () => {
    const fetch = jest.fn();
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("resource");

    const { response } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      fetch
    );

    expect(SolidClientFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      "iri",
      "dataset",
      { fetch }
    );
    expect(response).toEqual("resource");
  });

  test("it returns an error response if the save fails", async () => {
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      jest.fn()
    );

    expect(error).toEqual("boom");
  });
});

describe("deleteResource", () => {
  const mockDeleteFile = jest
    .spyOn(SolidClientFns, "deleteFile")
    .mockImplementation(jest.fn());

  const fetch = jest.fn();
  const resourceIri = "https://example.org/example.txt";
  const policiesContainer = "https://example.og/pb_policies/";
  const resourceInfo = mockSolidDatasetFrom(resourceIri);

  test("it won't try to delete policy if no policy container is given", async () => {
    await deleteResource(resourceInfo, null, fetch);

    expect(mockDeleteFile).toHaveBeenCalledWith(resourceIri, {
      fetch,
    });
  });

  test("it deletes the given resource only when no policy is found", async () => {
    getPolicyUrl.mockReturnValue(null);

    await deleteResource(resourceInfo, policiesContainer, fetch);

    expect(mockDeleteFile).toHaveBeenCalledWith(resourceIri, {
      fetch,
    });
    expect(mockDeleteFile).not.toHaveBeenCalledWith(null);
  });

  test("it deletes the given resource and corresponding access policy if available", async () => {
    getPolicyUrl.mockReturnValue("https://example.org/examplePolicyUrl");

    await deleteResource(resourceInfo, policiesContainer, fetch);

    expect(mockDeleteFile).toHaveBeenCalledWith(resourceIri, {
      fetch,
    });
    expect(mockDeleteFile).toHaveBeenCalledWith(
      "https://example.org/examplePolicyUrl",
      {
        fetch,
      }
    );
  });

  it("ignores 403 errors when deleting the policy resource", async () => {
    getPolicyUrl.mockReturnValue("https://example.org/examplePolicyUrl");
    SolidClientFns.deleteFile.mockResolvedValueOnce().mockImplementation(() => {
      throw new Error("403");
    });
    await expect(
      deleteResource(resourceInfo, policiesContainer, fetch)
    ).resolves.toBeUndefined();
  });

  it("ignores 404 errors when deleting the policy resource", async () => {
    getPolicyUrl.mockReturnValue("https://example.org/examplePolicyUrl");
    SolidClientFns.deleteFile.mockResolvedValueOnce().mockImplementation(() => {
      throw new Error("404");
    });
    await expect(
      deleteResource(resourceInfo, policiesContainer, fetch)
    ).resolves.toBeUndefined();
  });

  it("lets through other errors when deleting the policy resource", async () => {
    getPolicyUrl.mockReturnValue("https://example.org/examplePolicyUrl");
    SolidClientFns.deleteFile.mockResolvedValueOnce().mockImplementation(() => {
      throw new Error("500");
    });
    await expect(
      deleteResource(resourceInfo, policiesContainer, fetch)
    ).rejects.toEqual(new Error("500"));
  });
});
