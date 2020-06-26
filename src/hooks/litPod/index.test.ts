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

/* eslint-disable camelcase */

import {
  fetchLitDataset,
  getThingOne,
  getIriAll,
  unstable_fetchResourceInfoWithAcl,
} from "@solid/lit-pod";
import * as litSolidHelpers from "../../lit-solid-helpers";

import {
  fetchContainerResourceIris,
  fetchResourceDetails,
  fetchPodIrisFromWebId,
} from "./index";

jest.mock("@solid/lit-pod");

describe("fetchContainerResourceIris", () => {
  test("it fetches the container resource iris", async () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    (getIriAll as jest.Mock).mockReturnValue(resources);

    const fetchedResources = await fetchContainerResourceIris("containerIri");
    expect(fetchedResources).toEqual(resources);
  });
});

describe("fetchResourceDetails", () => {
  test("it fetches the resource, adding a human-readable name", async () => {
    const iri = "https://dayton.dev.inrupt.net/public/";

    (unstable_fetchResourceInfoWithAcl as jest.Mock).mockResolvedValue({
      resourceInfo: {
        fetchedFrom: "https://dayton.dev.inrupt.net/public/",
        contentType: "application/octet-stream; charset=utf-8",
        unstable_aclUrl: "https://dayton.dev.inrupt.net/public/.acl",
        unstable_permissions: {
          user: {
            read: true,
            append: true,
            write: true,
            control: true,
          },
          public: {
            read: true,
            append: false,
            write: false,
            control: false,
          },
        },
      },
      acl: {
        fallbackAcl: {
          quads: {},
          resourceInfo: {
            fetchedFrom: "https://dayton.dev.inrupt.net/.acl",
            contentType: "text/turtle",
            unstable_aclUrl: "https://dayton.dev.inrupt.net/.acl.acl",
            unstable_permissions: {
              user: {
                read: true,
                append: true,
                write: true,
                control: true,
              },
              public: {
                read: false,
                append: false,
                write: false,
                control: false,
              },
            },
          },
          accessTo: "https://dayton.dev.inrupt.net/",
        },
        resourceAcl: {
          quads: {},
          resourceInfo: {
            fetchedFrom: "https://dayton.dev.inrupt.net/public/.acl",
            contentType: "text/turtle",
            unstable_aclUrl: "https://dayton.dev.inrupt.net/public/.acl.acl",
            unstable_permissions: {
              user: {
                read: true,
                append: true,
                write: true,
                control: true,
              },
              public: {
                read: false,
                append: false,
                write: false,
                control: false,
              },
            },
          },
          accessTo: "https://dayton.dev.inrupt.net/public/",
        },
      },
    });

    jest.spyOn(litSolidHelpers, "normalizePermissions").mockResolvedValue([
      {
        webId: "https://dayton.dev.inrupt.net/card/#me",
        alias: "Full Control",
        acl: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
        profile: { webId: "https://dayton.dev.inrupt.net/card/#me" },
      },
    ]);

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/public");
    expect(resourceDetails.iri).toEqual(iri);
  });

  test("it fetches a file with ACL if the fetchResource call fails", async () => {
    const iri = "https://dayton.dev.inrupt.net/file.txt";

    jest.spyOn(litSolidHelpers, "fetchResource").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    jest
      .spyOn(litSolidHelpers, "fetchFileWithAcl")
      .mockResolvedValue({ iri, types: ["type"], file: new Blob(["file"]) });

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/file.txt");
    expect(resourceDetails.iri).toEqual(iri);
  });
});

describe("PodIrisFromWebId", () => {
  test("Loads data from a webId", async () => {
    const iri = "https://mypod.myhost.com/profile/card#me";
    const iris = ["https://mypod.myhost.com/profile"];

    (fetchLitDataset as jest.Mock).mockResolvedValue({});
    (getThingOne as jest.Mock).mockImplementationOnce(() => {});
    (getIriAll as jest.Mock).mockImplementationOnce(() => iris);

    expect(await fetchPodIrisFromWebId(iri)).toEqual(iris);

    expect(fetchLitDataset).toHaveBeenCalled();
    expect(getThingOne).toHaveBeenCalled();
    expect(getIriAll).toHaveBeenCalled();
  });
});
