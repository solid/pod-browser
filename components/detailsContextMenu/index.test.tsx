import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import DetailsContextMenu from "./index";

describe("Container view", () => {
  test("Renders a the drawer", () => {
    const tree = shallow(<DetailsContextMenu />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
