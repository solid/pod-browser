import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import Login from "./index";

describe("Login form", () => {
  test("Renders a login form, with button bound to swapLoginType", () => {
    const tree = shallow(<Login />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
