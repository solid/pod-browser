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

/* eslint react/require-default-props:off */

import React from "react";
import { ActionButton, Button } from "@inrupt/prism-react-components";
import T from "prop-types";
import { getPolicyType, isNamedPolicy } from "../../../../src/models/policy";
import ErrorMessage from "../../../errorMessage";

export const TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON =
  "There's no one to remove";

export default function PolicyActionButton({ permissions, type }) {
  const disableRemoveButton = permissions.length === 0 && isNamedPolicy(type);
  const policyType = getPolicyType(type);

  if (!policyType)
    return <ErrorMessage error={new Error("Type of policy not recognized")} />;

  return (
    <ActionButton label="Show menu for policy">
      <Button
        variant="in-menu"
        disabled={disableRemoveButton}
        disabledText={
          disableRemoveButton
            ? TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON
            : ""
        }
      >
        {policyType.removeButtonLabel}
      </Button>
    </ActionButton>
  );
}

PolicyActionButton.propTypes = {
  permissions: T.arrayOf(T.object),
  type: T.string.isRequired,
};

PolicyActionButton.defaultPtops = {
  permissions: [],
};
