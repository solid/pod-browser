import React from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { LitDataset, fetchLitDataset } from "lit-solid";
import ContainerTableRow, {
  fetchContainerDetails,
  getIriPath,
  handleTableRowClick,
  resourceLink,
} from "./index";

jest.mock("lit-solid");

const {
  addIri,
  createLitDataset,
  createThing,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
} = jest.requireActual("lit-solid");

function createContainer(): LitDataset {
  let publicContainer = createThing({
    iri: "https://user.dev.inrupt.net/public/",
  });
  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "http://www.w3.org/ns/ldp#BasicContainer"
  );
  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "http://www.w3.org/ns/ldp#Container"
  );
  publicContainer = setDatetime(
    publicContainer,
    "http://purl.org/dc/terms/modified",
    new Date(Date.UTC(2020, 5, 2, 15, 59, 21))
  );
  publicContainer = addIri(
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

  return setThing(createLitDataset(), publicContainer);
}

describe("ContainerTableRow", () => {
  test("it renders a table row", () => {
    const tree = shallow(<ContainerTableRow iri="iri" />);
    tree.simulate("click");
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("fetchContainerDetails", () => {
  test("it returns a normalized dataset", async () => {
    (fetchLitDataset as jest.Mock).mockImplementationOnce(async () => {
      return Promise.resolve(createContainer());
    });

    const expectedIri = "https://user.dev.inrupt.net/public/";
    const { name, iri } = await fetchContainerDetails(expectedIri);

    expect(name).toEqual("/public");
    expect(iri).toEqual(expectedIri);
    expect(fetchLitDataset).toHaveBeenCalled();
  });
});

describe("resourceLink", () => {
  test("it generates a resource link", () => {
    const link = resourceLink("https://example.com/example.ttl");
    expect(link).toEqual("/resource/https%3A%2F%2Fexample.com%2Fexample.ttl");
  });
});

describe("getIriPath", () => {
  test("it formats the iri for display", () => {
    expect(getIriPath("https://example.com/example")).toEqual("/example");
  });
});

describe("handleTableRowClick", () => {
  test("it opens the drawer and sets the menu contents", async () => {
    (fetchLitDataset as jest.Mock).mockImplementationOnce(async () => {
      return Promise.resolve(createContainer());
    });

    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const iri = "https://user.dev.inrupt.net/public/";
    const handler = handleTableRowClick({
      classes: {},
      iri,
      setMenuOpen,
      setMenuContents,
    });

    const evnt = { target: document.createElement("tr") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;
    await handler(evnt);

    expect(setMenuOpen).toHaveBeenCalledWith(true);
    expect(setMenuContents).toHaveBeenCalled();
    expect(setMenuContents.mock.calls[0][0]).toBeInstanceOf(Object);
  });
});
