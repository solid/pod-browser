import { shallow, mount } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import * as ReactFns from "react";
import DetailsContextMenu from "./index";

describe("Container view", () => {
  test("Renders a the drawer", () => {
    const tree = shallow(<DetailsContextMenu />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders closes the drawer when the close button is clicked", () => {
    const setMenuOpen = jest.fn();

    jest.spyOn(ReactFns, "useContext").mockImplementationOnce(() => {
      return { setMenuOpen, menuOpen: true };
    });

    const tree = mount(<DetailsContextMenu />);
    tree.find("WithStyles(ForwardRef(IconButton))").simulate("click");

    expect(setMenuOpen).toHaveBeenCalledWith(false);
  });
});
