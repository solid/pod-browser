/* eslint-disable camelcase */
import React from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import {
  LitDataset,
  unstable_fetchLitDatasetWithAcl,
  unstable_getAgentAccessModesAll,
} from "lit-solid";
import ContainerTableRow, { handleTableRowClick, resourceHref } from "./index";

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

describe("resourceHref", () => {
  test("it generates a resource link", () => {
    const link = resourceHref("https://example.com/example.ttl");
    expect(link).toEqual("/resource/https%3A%2F%2Fexample.com%2Fexample.ttl");
  });
});

describe("handleTableRowClick", () => {
  test("it opens the drawer and sets the menu contents", async () => {
    (unstable_fetchLitDatasetWithAcl as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.resolve(createContainer());
      }
    );

    (unstable_getAgentAccessModesAll as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.resolve({
          owner: { read: true, write: true, append: true, control: true },
          collaborator: {
            read: true,
            write: false,
            append: true,
            control: false,
          },
        });
      }
    );

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
  });

  test("it commits no operation when the click target is an anchor", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const iri = "https://user.dev.inrupt.net/public/";
    const handler = handleTableRowClick({
      classes: {},
      iri,
      setMenuOpen,
      setMenuContents,
    });

    const evnt = { target: document.createElement("a") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;
    await handler(evnt);

    expect(setMenuOpen).not.toHaveBeenCalled();
    expect(setMenuContents).not.toHaveBeenCalled();
  });
});
