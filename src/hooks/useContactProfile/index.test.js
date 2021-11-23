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

import { renderHook } from "@testing-library/react-hooks";
import useSWR from "swr";
import { useSession } from "@inrupt/solid-ui-react";
import { createThing, mockThingFrom } from "@inrupt/solid-client";
import useContactProfile from "./index";
import * as profileModel from "../../models/profile";
import * as addressBookFns from "../../addressBook";
import * as resourceFns from "../../solidClientHelpers/resource";

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
jest.mock("swr");

const mockedSwrHook = useSWR;

describe("useContactProfile", () => {
  const swrResponse = 42;

  beforeEach(() => {
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  useSession.mockReturnValue({ fetch: jest.fn() });
  it("exits if no person url", async () => {
    const contactThing = createThing();
    renderHook(() => useContactProfile(contactThing));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });

  it("returns contact profile", async () => {
    const contactThing = mockThingFrom(
      "https://example.org/contacts/Person/1234"
    );

    const profile = {
      name: "Example",
      avatar: null,
      webId: "https://example.org",
    };

    jest.spyOn(resourceFns, "getResource").mockResolvedValue({
      response: {
        dataset: contactThing,
        iri: "https://example.org/contacts/Person/1234",
      },
    });

    jest
      .spyOn(addressBookFns, "getWebIdUrl")
      .mockReturnValue("https://example.org");

    jest.spyOn(profileModel, "getProfileForContact").mockResolvedValue(profile);

    renderHook(() => useContactProfile(contactThing));

    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(profile);
  });
});
