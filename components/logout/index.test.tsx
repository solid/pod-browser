import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Router from "next/router";
import auth from "solid-auth-client";

import LogOutButton from "./index";

jest.mock("next/router");
jest.mock("solid-auth-client");

describe("Logout button", () => {
  test("Renders a logout button", () => {
    const tree = shallow(<LogOutButton />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Calls logout and redirects on click", async () => {
    (auth.logout as jest.Mock).mockResolvedValue(null);
    (Router.push as jest.Mock).mockResolvedValue(null);

    const tree = shallow(<LogOutButton />);
    tree.simulate("click", { preventDefault: () => {} });

    // Simulate an await before continuing.
    await auth.logout();

    expect(Router.push).toHaveBeenCalledWith("/login");
    expect(auth.logout).toHaveBeenCalled();
  });
});
