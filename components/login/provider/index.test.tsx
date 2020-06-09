import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import { login } from "@inrupt/solid-auth-fetcher";

import getProviders from "../../../constants/provider";
import getConfig from "../../../constants/config";

import ProviderLogin, { loginWithProvider } from "./index";

jest.mock("@inrupt/solid-auth-fetcher");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = shallow(<ProviderLogin />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("calls login when the form is submitted", () => {
    const tree = shallow(<ProviderLogin />);
    tree.simulate("submit", { preventDefault: () => {} });
    expect(login).toHaveBeenCalled();
  });
});

describe("loginWithProvider", () => {
  test("Calls login with clientId if useClientId is true", async () => {
    const oidcIssuer = getProviders()[0];
    const clientId = getConfig().idpClientId;
    (login as jest.Mock).mockResolvedValue(null);

    await loginWithProvider({
      ...oidcIssuer,
      useClientId: true,
    });

    expect(login).toHaveBeenCalledWith({
      clientId,
      oidcIssuer: oidcIssuer.value,
      redirect: "/",
    });
  });

  test("Calls login without clientId if useClientId is true", async () => {
    const oidcIssuer = getProviders()[0];
    (login as jest.Mock).mockResolvedValue(null);

    await loginWithProvider({
      ...oidcIssuer,
      useClientId: false,
    });

    expect(login).toHaveBeenCalledWith({
      oidcIssuer: oidcIssuer.value,
      redirect: "/",
    });
  });
});
