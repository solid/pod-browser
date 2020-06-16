import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";

import Header from "./index";
import theme from "../../src/theme";

describe("Header", () => {
  describe("with user logged in", () => {
    test("renders with a logout button", () => {
      jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
        session: true,
      }));

      const tree = shallow(
        <ThemeProvider theme={theme}>
          <Header />
        </ThemeProvider>
      );
      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("with user logged out", () => {
    test("renders without a logout button", () => {
      jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
        session: undefined,
      }));

      const tree = shallow(
        <ThemeProvider theme={theme}>
          <Header />
        </ThemeProvider>
      );
      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });
});
