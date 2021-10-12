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

import { DatasetContext } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { useState, useEffect, useContext } from "react";
import { getPolicyDetailFromAccess } from "../../accessControl/acp";
import AccessControlContext from "../../contexts/accessControlContext";
import useConsentBasedAccessForResource from "../useConsentBasedAccessForResource";
import {
  getRequestedAccessesFromSignedVc,
  getRequestorWebIdFromSignedVc,
} from "../../models/consent/signedVc";

const normalizeConsentBasedPermissions = (consentBasedPermissions) => {
  if (!consentBasedPermissions) return [];
  const requestedAccessModes = consentBasedPermissions.map((vc) => {
    const accessMode = {
      read: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Read")
      ),
      write: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Write")
      ),
      append: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Append")
      ),
      control: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Control")
      ),
    };
    return {
      acl: accessMode,
      vc,
    };
  });

  const normalizedPermissions = requestedAccessModes.map(({ acl, vc }) => {
    return {
      type: "agent",
      acl,
      webId: getRequestorWebIdFromSignedVc(vc),
      alias: getPolicyDetailFromAccess(acl, "name"),
      vc,
    };
  });
  return normalizedPermissions;
};

export default function useAllPermissions() {
  const { accessControl } = useContext(AccessControlContext);
<<<<<<< HEAD
  const { solidDataset: dataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const {
    permissions: consentBasedPermissions,
  } = useConsentBasedAccessForResource(datasetUrl);
  const [acpPermissions, setAcpPermissions] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [consentPermissions, setConsentPermissions] = useState([]);
=======
  const { datasetUrl } = useContext(DatasetContext);
  const consentBasedPermissions = useConsentBasedAccessForResource(datasetUrl);
  const [permissions, setPermissions] = useState(null);
  const [consentPermissions, setConsentPermissions] = useState(null);
>>>>>>> Feat: display consent based agents in Sharing panel

  useEffect(() => {
    if (!accessControl) {
      setPermissions(null);
      return;
    }
    accessControl
      .getAllPermissionsForResource()
      .then((normalizedPermissions) => {
        setAcpPermissions(normalizedPermissions.reverse());
      });
<<<<<<< HEAD
    const normalizedConsentPermissions = consentBasedPermissions
      ? normalizeConsentBasedPermissions(consentBasedPermissions)
      : [];
    setConsentPermissions(normalizedConsentPermissions);
  }, [accessControl, consentBasedPermissions]);

  useEffect(() => {
    if (!acpPermissions.length && !consentPermissions.length) return;
    setPermissions([...acpPermissions, ...consentPermissions]);
  }, [acpPermissions, consentPermissions]);

  return {
    permissions,
  };
=======
    const normalizedConsentPermissions =
      consentBasedPermissions ??
      normalizeConsentBasedPermissions(consentBasedPermissions);
    setConsentPermissions(normalizedConsentPermissions);
  }, [accessControl, consentBasedPermissions]);

  return { permissions: permissions?.concat(consentPermissions) };
>>>>>>> Feat: display consent based agents in Sharing panel
}
