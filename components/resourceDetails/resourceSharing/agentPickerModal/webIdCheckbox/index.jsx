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

// REFACTOR REMOVE THIS FILE

import React, { useCallback, useContext } from "react";
import { useThing } from "@inrupt/solid-ui-react";
import { getUrl } from "@inrupt/solid-client";
import PropTypes from "prop-types";
import { Checkbox } from "@material-ui/core";
import useContactProfile from "../../../../../src/hooks/useContactProfile";
import {
  getWebIdsFromInheritedPermissions,
  getWebIdsFromPermissions,
} from "../../../../../src/accessControl/acp";
import PermissionsContext from "../../../../../src/contexts/permissionsContext";

export const TESTCAFE_ID_WEBID_CHECKBOX = "webid-checkbox";
const AGENT_PREDICATE = "http://www.w3.org/ns/solid/acp#agent";

export default function WebIdCheckbox({ value, index, toggleCheckbox, type }) {
  const {
    permissions: allPermissions,
    addingWebId,
    newAgentsWebIds,
    webIdsToDelete,
  } = useContext(PermissionsContext);
  const { thing } = useThing();
  const { data: profile } = useContactProfile(thing);
  const agentIdentifier = thing && getUrl(thing, AGENT_PREDICATE); // todo: add corresponding groupIdentifier when adding groups
  const permissions = allPermissions?.filter((p) => p.alias === type);
  const webIdsInPermissions = getWebIdsFromPermissions(permissions);
  const webIdsFromInheritedPermissions =
    getWebIdsFromInheritedPermissions(permissions);

  const agentId = useCallback(() => {
    let agentIdentifierValue;
    if (!agentIdentifier && profile) {
      agentIdentifierValue = profile.webId;
    } else if (agentIdentifier) {
      agentIdentifierValue = value;
    } else if (!agentIdentifier && index === 0) {
      agentIdentifierValue = "";
    }
    return agentIdentifierValue;
  }, [agentIdentifier, index, profile, value]);

  const checked = useCallback(() => {
    if (index === 0 && addingWebId) {
      return true;
    }
    if (newAgentsWebIds.includes(agentId())) {
      return true;
    }
    if (
      webIdsInPermissions.includes(agentId()) &&
      !webIdsToDelete.includes(agentId())
    ) {
      return true;
    }
    return false;
  }, [
    addingWebId,
    agentId,
    index,
    newAgentsWebIds,
    webIdsInPermissions,
    webIdsToDelete,
  ]);
  const disabled = useCallback(
    () => webIdsFromInheritedPermissions.indexOf(agentId()) !== -1,
    [agentId, webIdsFromInheritedPermissions]
  );

  return (
    <Checkbox
      inputProps={{ "data-testid": TESTCAFE_ID_WEBID_CHECKBOX }}
      type="checkbox"
      color="primary"
      size="medium"
      value={agentId() || ""}
      disabled={disabled()}
      checked={checked() || false}
      onChange={(e) => toggleCheckbox(e, index, agentId())}
    />
  );
}
WebIdCheckbox.propTypes = {
  value: PropTypes.string,
  index: PropTypes.number.isRequired,
  toggleCheckbox: PropTypes.func,
  type: PropTypes.string.isRequired,
};

WebIdCheckbox.defaultProps = {
  value: null,
  toggleCheckbox: () => {},
};
