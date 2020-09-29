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

import { fetchLitDataset, getThing, getIriAll } from "@inrupt/solid-client";
import { fetchContainerResourceIris, fetchPodIrisFromWebId } from "./index";
import mockFetch from "../../../__testUtils/mockFetch";

jest.mock("@inrupt/solid-client");
jest.mock("swr");

const fetch = mockFetch();

describe("fetchContainerResourceIris", () => {
  test("it fetches the container resource iris", async () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    getIriAll.mockReturnValue(resources);

    const fetchedResources = await fetchContainerResourceIris(
      "containerIri",
      fetch
    );
    expect(fetchedResources).toEqual(resources);
  });
});

describe("PodIrisFromWebId", () => {
  test("Loads data from a webId", async () => {
    const iri = "https://mypod.myhost.com/profile/card#me";
    const iris = ["https://mypod.myhost.com/profile"];

    fetchLitDataset.mockResolvedValue({});
    getThing.mockImplementationOnce(() => {});
    getIriAll.mockImplementationOnce(() => iris);

    expect(await fetchPodIrisFromWebId(iri, fetch)).toEqual(iris);

    expect(fetchLitDataset).toHaveBeenCalled();
    expect(getThing).toHaveBeenCalled();
    expect(getIriAll).toHaveBeenCalled();
  });
});
