/* eslint-disable camelcase */
import React from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mock } from "jest-mock-extended";
import ContainerTableRow, {
  handleTableRowClick,
  resourceHref,
  ResourceDetails,
} from "./index";

describe("ContainerTableRow", () => {
  test("it renders a table row", () => {
    const resource = mock<ResourceDetails>({
      iri: "https://example.com/example.ttl",
    });

    const tree = shallow(<ContainerTableRow resource={resource} />);

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
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const handler = handleTableRowClick({
      classes: {},
      resource: mock<ResourceDetails>(),
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
    const handler = handleTableRowClick({
      classes: {},
      resource: mock<ResourceDetails>(),
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
