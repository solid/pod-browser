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

import React, { ReactElement, ReactNode, useContext } from "react";
import { DrawerContainer } from "@inrupt/prism-react-components";
import { useRouter } from "next/router";
import DetailsContextMenu, { handleCloseDrawer } from "../detailsContextMenu";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";

interface Props {
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
  mutate: () => void;
}

export default function ContainerDetails({
  children,
  mutate,
}: Props): ReactElement {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);
  const router = useRouter();

  const drawer = (
    <DetailsContextMenu
      onUpdate={() => {
        mutate();
        handleCloseDrawer({ setMenuOpen, router })().catch((e) => {
          throw e;
        });
      }}
    />
  );

  return (
    <DrawerContainer drawer={drawer} open={menuOpen}>
      {children}
    </DrawerContainer>
  );
}
