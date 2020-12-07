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

import React, { useEffect, useState } from "react";
import T from "prop-types";
import { Icons, Message } from "@inrupt/prism-react-components";

export const TESTCAFE_ID_NO_CONTROL_ERROR = "no-control-error";
export const TESTCAFE_ID_NO_CONTROL_CLOSE_BUTTON = "no-control-close-button";

export function setupOnClose() {
  return (event) => {
    event.preventDefault();
    sessionStorage.setItem("no-control-warning-closed", "true");
  };
}

export default function NoControlWarning({ podRootIri }) {
  const [appUrl, setAppUrl] = useState(null);
  const bem = Message.useBem();
  const open = !sessionStorage.getItem("no-control-warning-closed");

  useEffect(() => setAppUrl(window.location.origin), []);

  const onClose = setupOnClose();

  return open ? (
    <Message
      variant="warning"
      prominent
      hasIcon
      onClose={onClose}
      closeButtonProps={{ "data-testid": TESTCAFE_ID_NO_CONTROL_CLOSE_BUTTON }}
      data-testid={TESTCAFE_ID_NO_CONTROL_ERROR}
    >
      <p className={bem("message__title")}>
        You can&apos;t share anything or change permissions in your Pod
      </p>
      <p>
        This is because you don&apos;t have control access. You can still browse
        the resources in your Pod, but you won&apos;t be able to share anything.
      </p>
      <p className={bem("message__title")}>How to fix:</p>
      <ol>
        <li>
          <span>Log in to </span>
          <a href={podRootIri} target="_blank" rel="noreferrer">
            <span>your Pod</span>
            <Icons name="external-link" data-external />
          </a>
        </li>
        <li>Go to “Preferences”</li>
        <li>
          <span>Under “Manage your trusted applications,” look for </span>
          <span>{appUrl}</span>
          <span> and check the “Control” box</span>
        </li>
        <li>Click on “Update”</li>
        <li>Return to PodBrowser</li>
      </ol>
    </Message>
  ) : null;
}

NoControlWarning.propTypes = {
  podRootIri: T.string.isRequired,
};
