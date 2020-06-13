import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import ContainerDetails from "./index";

describe("Container details", () => {
  test("Renders container details", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "webId" },
    }));

    const tree = shallow(
      <ContainerDetails name="Container Name" type="Container" iri="iri" />
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
