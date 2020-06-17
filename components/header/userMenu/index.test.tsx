import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";

import UserMenu from "./index";
import theme from "../../../src/theme";

describe("UserMenu", () => {
  test("renders a menu", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: undefined,
    }));

    const tree = shallow(
      <ThemeProvider theme={theme}>
        <UserMenu />
      </ThemeProvider>
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  // TODO: Write test for the various ways to toggle the user menu
  // TODO: Write test for checking profile image
});
