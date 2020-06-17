import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";

import MainNav from "./index";
import theme from "../../../src/theme";

describe("MainNav", () => {
  test("renders navigation", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: undefined,
    }));

    const tree = shallow(
      <ThemeProvider theme={theme}>
        <MainNav />
      </ThemeProvider>
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
