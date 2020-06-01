/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactElement, useState } from "react";

interface DetailsContext {
  menuOpen: boolean;
  contents?: ReactElement;
  setMenuOpen?: any;
  setMenuContents?: any;
}

const DetailsMenuContext = createContext<DetailsContext>({ menuOpen: false });

interface Props {
  children?: ReactElement | ReactElement[];
}

function DetailsMenuProvider({ children }: Props): ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contents, setMenuContents] = useState();

  return (
    <DetailsMenuContext.Provider
      value={{ menuOpen, contents, setMenuOpen, setMenuContents }}
    >
      {children}
    </DetailsMenuContext.Provider>
  );
}

export { DetailsMenuProvider };
export default DetailsMenuContext;
