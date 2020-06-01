/* eslint-disable react/jsx-props-no-spreading */
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import ContainerDetails from "./index";

describe("Container details", () => {
  test("Renders container details", () => {
    const props = {
      name: "Container Name",
      type: "Container",
      iri: "iri",
    };
    const tree = shallow(<ContainerDetails {...props} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
