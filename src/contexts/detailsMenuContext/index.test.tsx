import { useContext, ReactElement } from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import DetailsMenuContext, { DetailsMenuProvider } from "./index";

function ChildComponent(): ReactElement {
  const { menuOpen, contents, setMenuContents } = useContext(
    DetailsMenuContext
  );
  setMenuContents("contents");
  return (
    <div>
      <div className="menuOpen">{menuOpen ? "true" : "false"}</div>
      <div className="contents">{contents}</div>
    </div>
  );
}

describe("DetailsMenuContext", () => {
  test("it has context data", () => {
    const component = shallow(
      <DetailsMenuProvider>{ChildComponent}</DetailsMenuProvider>
    );

    expect(shallowToJson(component)).toMatchSnapshot();
  });
});
