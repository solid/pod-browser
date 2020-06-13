import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Details, { getDetailsComponent, ResourceProps } from "./index";

jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
  session: { webId: "webId" },
}));

describe("Details", () => {
  describe("when given a container", () => {
    test("it renders a ContainerDetails component", () => {
      const name = "container";
      const type = "BasicContainer";
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
        <Details name={name} type={type} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given a resource", () => {
    test("it renders a ResourceDetails component", () => {
      const name = "container";
      const type = "NotAContainer";
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
        <Details name={name} type={type} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });
});

describe("getDetailsComponent", () => {
  describe("when given a container", () => {
    test("it renders a ContainerDetails component", () => {
      const props: ResourceProps = {
        name: "container",
        type: "Container",
        iri: "iri",
        acl: {
          webId: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      };

      const component = getDetailsComponent(props);
      const tree = shallow(component);

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given a resource", () => {
    test("it renders a ResourceDetails component", () => {
      const props: ResourceProps = {
        name: "container",
        type: "NotAContainer",
        iri: "iri",
        acl: {
          webId: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      };

      const component = getDetailsComponent(props);
      const tree = shallow(component);

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });
});
