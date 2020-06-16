import { shallow, mount } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import { ThemeProvider } from "@material-ui/core/styles";
import { useRedirectIfLoggedIn } from "../../../src/effects/auth";
import LoginPage from "./index";

import theme from "../../../src/theme";

jest.mock("../../../src/effects/auth");

describe("Login page", () => {
  test("Renders a logout button", () => {
    const tree = shallow(
      <ThemeProvider theme={theme}>
        <LoginPage />
      </ThemeProvider>
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Redirects if the user is logged out", () => {
    mount(
      <ThemeProvider theme={theme}>
        <LoginPage />
      </ThemeProvider>
    );
    expect(useRedirectIfLoggedIn).toHaveBeenCalled();
  });
});
