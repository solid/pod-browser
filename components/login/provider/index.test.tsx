import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import auth from "solid-auth-client";

import getProviders from "../../../constants/provider";

import ProviderLogin, { loginWithProvider } from "./index";

jest.mock("solid-auth-client");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = shallow(<ProviderLogin />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("calls login when the form is submitted", () => {
    const tree = shallow(<ProviderLogin />);
    tree.simulate("submit", { preventDefault: () => {} });
    expect(auth.login).toHaveBeenCalled();
  });
});

describe("loginWithProvider", () => {
  test("Calls login", async () => {
    const oidcIssuer = getProviders()[0];
    (auth.login as jest.Mock).mockResolvedValue(null);

    await loginWithProvider(oidcIssuer);

    expect(auth.login).toHaveBeenCalledWith(oidcIssuer.value);
  });
});
