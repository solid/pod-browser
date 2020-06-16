import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";

import Login from "./index";
import theme from "../../src/theme";

describe("Login form", () => {
  test("Renders a login form, with button bound to swapLoginType", () => {
    const tree = shallow(
      <ThemeProvider theme={theme}>
        <Login />
      </ThemeProvider>
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
