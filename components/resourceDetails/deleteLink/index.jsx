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

import React, { useContext } from "react";
import { deleteFile } from "@inrupt/solid-client";
import SessionContext from "../../../src/contexts/sessionContext";

/* eslint react/jsx-props-no-spreading: 0 */
/* eslint react/prop-types: 0 */
export default React.forwardRef(
  ({ resourceIri, onDelete, onDeleteError, ...linkProps }, ref) => {
    const { session } = useContext(SessionContext);

    async function deleteResource(e) {
      e.preventDefault();

      try {
        await deleteFile(resourceIri, { fetch: session.fetch });
        onDelete();
      } catch (err) {
        onDeleteError(err);
      }
    }

    /* eslint jsx-a11y/anchor-has-content: 0 */
    return (
      <a href="#delete" {...linkProps} ref={ref} onClick={deleteResource} />
    );
  }
);
