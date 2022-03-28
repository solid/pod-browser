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
import { getWebIdsFromPermissions } from "../../../../src/accessControl/acp";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";
import {
  findPersonContactInAddressBook,
  savePerson,
} from "../../../../src/models/contact/person";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";

export const setupWebIdCheckBoxObject = (permissions) => {
  const webIds = getWebIdsFromPermissions(permissions);
  const output = {
    "http://www.w3.org/ns/solid/acp#PublicAgent": true,
    [AUTHENTICATED_AGENT_PREDICATE]: true,
  };
  webIds.forEach((webId) => {
    output[webId] = true;
  });
  return output;
};

export const removeExistingAgentFromOtherPolicies = ({
  permissions,
  newPolicy,
  agentWebId,
  accessControl,
}) => {
  const existingPermission = permissions.filter(
    (p) => p.webId === agentWebId && p.alias !== newPolicy
  );
  if (existingPermission.length) {
    existingPermission.map((ep) =>
      accessControl.removeAgentFromPolicy(ep.webId, ep.alias)
    );
  }
};

export const handleSaveContact = async (iri, addressBook, fetch) => {
  let error;
  if (!iri) {
    return;
  }

  try {
    const { name, webId } = await fetchProfile(iri, fetch);
    const existingContact = await findPersonContactInAddressBook(
      addressBook,
      webId,
      fetch
    );
    if (existingContact.length) {
      return;
    }

    if (name) {
      const contact = { webId, fn: name };
      await savePerson(addressBook, contact, fetch);
    }
  } catch (e) {
    error = e; // need to do something with the error otherwise the function exits at any point a webId fails and does not continue processing the rest
  }
};

export const getConfirmationDialogText = (
  numberOfPermissionsChanged,
  resourceName
) => {
  const title = `Change permissions for ${
    numberOfPermissionsChanged === 1
      ? "1 person"
      : `${numberOfPermissionsChanged} people`
  }`;
  const content = `Continuing will change ${
    numberOfPermissionsChanged === 1
      ? "1 person's "
      : `${numberOfPermissionsChanged} people's `
  } permissions to ${resourceName}`;
  return { title, content };
};
