import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Router from "next/router";
import { logout } from "@inrupt/solid-auth-fetcher";

import LogOutButton from "./index";

jest.mock("next/router");
jest.mock("@inrupt/solid-auth-fetcher");

describe("Logout button", () => {
  test("Renders a logout button", () => {
    const tree = shallow(<LogOutButton />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Calls logout and redirects on click", () => {
    const tree = shallow(<LogOutButton />);
    tree.simulate("click", { preventDefault: () => {} });

    expect(Router.push).toHaveBeenCalledWith("/login");
    expect(logout).toHaveBeenCalled();
  });
});
