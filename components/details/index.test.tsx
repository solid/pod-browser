import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Details from "./index";

jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
  session: { webId: "webId" },
}));

describe("Details", () => {
  describe("when given a container", () => {
    test("it renders a ContainerDetails component", () => {
      const name = "container";
      const types = ["BasicContainer"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given a resource", () => {
    test("it renders a ResourceDetails component", () => {
      const name = "container";
      const types = ["NotAContainer"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given an unknown resource", () => {
    test("it renders an Unknown resource message", () => {
      const name = "container";
      const types = ["Unknown"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });
});
