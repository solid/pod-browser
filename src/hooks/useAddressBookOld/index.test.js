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
// import * as solidUiReactFns from "@inrupt/solid-ui-react";
import { useSession } from "@inrupt/solid-ui-react";
import mockSession, {
  mockUnauthenticatedSession,
  webIdUrl,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useAddressBookOld from "./index";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { getResource } from "../../solidClientHelpers/resource";
import * as addressBookFns from "../../addressBook";
import useContactsContainerUrl from "../useContactsContainerUrl";

jest.mock("@inrupt/solid-ui-react", () => {
  const uiReactModule = jest.requireActual("@inrupt/solid-ui-react");
  return {
    SessionContext: uiReactModule.SessionContext,
    useSession: jest.fn(),
  };
});
const mockedUseSession = useSession;

jest.mock("../../solidClientHelpers/resource");

jest.mock("../useContactsContainerUrl");
const mockedContactsContainerUrl = useContactsContainerUrl;

jest.mock("../useAuthenticatedProfile");
const mockedUseAuthenticatedProfile = useAuthenticatedProfile;

describe("useAddressBookOld", () => {
  const contactsIri = "http://example.com/contacts/";

  beforeEach(() => {
    mockedContactsContainerUrl.mockReturnValue(contactsIri);
  });

  describe("with an unauthenticated user", () => {
    it("should not return any addressBook", () => {
      const session = mockUnauthenticatedSession();
      mockedUseSession.mockReturnValue({ session });
      mockedUseAuthenticatedProfile.mockReturnValue({ data: null });

      const wrapper = mockSessionContextProvider(session);
      const { result } = renderHook(() => useAddressBookOld(), {
        wrapper,
      });
      expect(result.current).toEqual([null, null]);
    });
  });

  describe("with an authenticated user", () => {
    let session;
    let wrapper;
    const profile = { webId: webIdUrl };

    describe("with an existing address book", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
        mockedUseSession.mockReturnValue({ session });
        mockedUseAuthenticatedProfile.mockReturnValue({ data: profile });
      });

      it("should call getResource", async () => {
        const dataset = 42;
        getResource.mockResolvedValue({ response: { dataset } });
        const { waitForNextUpdate } = renderHook(() => useAddressBookOld(), {
          wrapper,
        });
        await waitForNextUpdate();
        expect(getResource).toHaveBeenCalledWith(
          addressBookFns.getContactsIndexIri(contactsIri),
          session.fetch
        );
      });

      it("should return the address book resource", async () => {
        const dataset = 42;
        getResource.mockResolvedValue({ response: { dataset } });
        mockedUseSession.mockReturnValue({ session });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBookOld(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([dataset, null]);
      });

      it("should return error if anything goes wrong", async () => {
        const error = "Something went wrong";
        getResource.mockResolvedValue({ error });
        mockedUseSession.mockReturnValue({ session });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBookOld(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([null, error]);
      });
    });

    describe("with address book missing", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
        mockedUseSession.mockReturnValue({ session });
        getResource.mockResolvedValue({ response: null, error: "404" });
      });

      it("should return a new address book resource", async () => {
        const dataset = 1337;
        jest.spyOn(addressBookFns, "saveNewAddressBook").mockResolvedValue({
          response: {
            index: dataset,
          },
        });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBookOld(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([dataset, null]);
      });

      it("should return error if anything goes wrong when creating new address book", async () => {
        const error = "Something went wrong";
        jest
          .spyOn(addressBookFns, "saveNewAddressBook")
          .mockResolvedValue({ error });
        mockedUseSession.mockReturnValue({ session });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBookOld(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([null, error]);
      });
    });
  });
});
