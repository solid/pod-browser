import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import Container, { getContainerResourceIrisFromContainerIri } from "./index";

jest.mock("solid-auth-client");
jest.mock("lit-solid");

const iri = "https://mypod.myhost.com/container";

describe("Container view", () => {
  test("Renders a container view", () => {
    const tree = shallow(<Container iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders a table with data", () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    // Mock the resources useState call
    jest
      .spyOn(ReactFns, "useState")
      .mockImplementationOnce(() => [resources, () => {}]);

    // Mock the isLoading useState call
    jest
      .spyOn(ReactFns, "useState")
      .mockImplementationOnce(() => [false, () => {}]);

    const tree = shallow(<Container iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("Loading container resource iri list", () => {
  test("Loads resource iris from a container iri", async () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    const { getIriAll }: { getIriAll: jest.Mock } = jest.requireMock(
      "lit-solid"
    );

    getIriAll.mockImplementationOnce(() => resources);

    expect(await getContainerResourceIrisFromContainerIri(iri)).toEqual(
      resources
    );
  });
});
