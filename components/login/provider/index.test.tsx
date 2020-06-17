import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import auth from "solid-auth-client";

import { ThemeProvider } from "@material-ui/core/styles";
import getProviders from "../../../constants/provider";

import ProviderLogin, * as ProviderFunctions from "./index";
import theme from "../../../src/theme";

jest.mock("solid-auth-client");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = shallow(
      <ThemeProvider theme={theme}>
        <ProviderLogin />
      </ThemeProvider>
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("loginWithProvider", () => {
  test("Calls login", async () => {
    const oidcIssuer = getProviders()[0];
    (auth.popupLogin as jest.Mock).mockResolvedValue(null);

    await ProviderFunctions.loginWithProvider(oidcIssuer.value);

    expect(auth.popupLogin).toHaveBeenCalledWith({
      popupUri: `${oidcIssuer.value}common/popup.html`,
    });
  });
});
