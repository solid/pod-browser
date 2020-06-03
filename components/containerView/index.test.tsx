import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mock } from "jest-mock-extended";
import { ILoggedInSolidSession } from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";

import ContainerView, { getContainerResourceIrisFromSession } from "./index";

jest.mock("@inrupt/solid-auth-fetcher");
jest.mock("lit-solid");

describe("Container view", () => {
  test("Renders a container view", () => {
    const tree = shallow(<ContainerView />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("Loading container resource iri list", () => {
  test("Returns empty properties if there is no session", async () => {
    expect(await getContainerResourceIrisFromSession(undefined)).toEqual({
      containerIri: "",
      resources: [],
    });
  });

  test("Loads resource iris if there is a session", async () => {
    const session = mock<ILoggedInSolidSession>();
    const containerIri = "https://myaccount.mypodserver.com";

    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    // Disable this rule to allow mocks. Not sure of a better way.
    /* eslint @typescript-eslint/no-explicit-any: 0 */

    const { getSession }: { getSession: jest.Mock } = jest.requireMock(
      "@inrupt/solid-auth-fetcher/dist"
    );

    getSession.mockImplementation(() =>
      Promise.resolve({
        webId: "https://myaccount.mypodserver.com/profile/card#me",
      })
    );

    const { getIriAll }: { getIriAll: jest.Mock } = jest.requireMock(
      "lit-solid"
    );

    getIriAll.mockImplementationOnce(() => [containerIri]);
    getIriAll.mockImplementationOnce(() => resources);

    expect(await getContainerResourceIrisFromSession(session)).toEqual({
      containerIri,
      resources,
    });
  });
});
