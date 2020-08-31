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

import React, { ReactElement } from "react";
import { PageHeader as PrismPageHeader } from "@inrupt/prism-react-components";
import ContainerDetails from "../containerDetailsButton";
import AddFileButton from "../addFileButton";

interface Props {
  mutate: () => void;
}

export default function PageHeader({ mutate }: Props): ReactElement {
  const pageHeaderAction = PrismPageHeader.actionClassName();

  const containerDetails = <ContainerDetails className={pageHeaderAction} />;
  const addFileButton = (
    <AddFileButton onSave={mutate} className={pageHeaderAction} />
  );
  return (
    <PrismPageHeader
      title="Files"
      actions={[containerDetails, addFileButton]}
    />
  );
}
