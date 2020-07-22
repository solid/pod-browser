/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  Dispatch,
  ReactElement,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/router";

interface DetailsContext {
  action: string | null;
  iri: string | null;
  menuOpen: boolean;
  setAction: Dispatch<string>;
  setIri: Dispatch<string>;
  setMenuOpen: Dispatch<boolean>;
}

export const DETAILS_CONTEXT_ACTIONS = {
  SHARING: "sharing",
  DETAILS: "details",
};

const DetailsMenuContext = createContext<DetailsContext>({
  action: null,
  iri: null,
  menuOpen: false,
  setAction: (action: string) => action,
  setIri: (iri: string) => iri,
  setMenuOpen: (open: boolean) => open,
});

interface Props {
  children: ReactElement | ReactElement[] | undefined;
}

function DetailsMenuProvider({ children }: Props): ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState("");
  const [iri, setIri] = useState("");
  const router = useRouter();

  useEffect(() => {
    const { query } = router;
    const routeAction = query.action ? (query.action as string) : "";
    const routeIri = query.iri ? (query.iri as string) : "";

    setMenuOpen(!!routeAction);
    setAction(routeAction);
    setIri(routeIri);
  }, [router, action, iri, setAction, setIri, setMenuOpen]);

  return (
    <DetailsMenuContext.Provider
      value={{
        action,
        iri,
        menuOpen,
        setAction,
        setIri,
        setMenuOpen,
      }}
    >
      {children}
    </DetailsMenuContext.Provider>
  );
}

export { DetailsMenuProvider };
export default DetailsMenuContext;
