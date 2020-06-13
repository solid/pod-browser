import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import ResourceDetails from "./index";

describe("Container details", () => {
  test("renders container details", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
      },
      {
        webId: "collaborator",
        alias: "Can View",
        acl: {
          append: false,
          control: false,
          read: true,
          write: false,
        },
      },
    ];

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = shallow(
      <ResourceDetails
        name="Container Name"
        types={["Container"]}
        iri="iri"
        classes={classes}
        permissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("renders no 3rd party access message", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
      },
    ];

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = shallow(
      <ResourceDetails
        name="Container Name"
        types={["Container"]}
        iri="iri"
        classes={classes}
        permissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
