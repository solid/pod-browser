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

import { useState, useEffect } from "react";
import {
  getAccessWithConsentAll,
  isValidConsentGrant,
} from "@inrupt/solid-client-access-grants";
import { useSession } from "@inrupt/solid-ui-react";

export default function useConsentBasedAccessForResource(resourceUrl) {
  const [permissions, setPermissions] = useState(null);
  const [permissionsError, setPermissionsError] = useState(null);
  const { fetch } = useSession();
  useEffect(() => {
    if (!resourceUrl) {
      setPermissions(null);
      return;
    }
    async function checkVcValidity(vc) {
      try {
        const response = await isValidConsentGrant(vc, { fetch });
        return response;
      } catch (err) {
        return null;
      }
    }
    (async () => {
      try {
        const access = await getAccessWithConsentAll(resourceUrl, { fetch });
        const validVcs = await Promise.all(
          access.map(async (vc) => {
            const isValidVc = await checkVcValidity(vc);
            if (!isValidVc.errors.length) {
              return vc;
            }
            return null;
          })
        );
        setPermissions(validVcs.filter((vc) => vc !== null));
      } catch (err) {
        setPermissionsError(err);
      }
    })();
  }, [resourceUrl, fetch]);
  return { permissions, permissionsError };
}
