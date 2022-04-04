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

// TODO: remove after 2.0
/* istanbul ignore file */

import {
  hasAccessibleAcl,
  acp_v3 as acp3,
  getSourceUrl,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import useSWR from "swr";

export const ACP = "acp";
export const WAC = "wac";

async function getAccessControlType(resourceInfo, fetch) {
  const resourceUrl = getSourceUrl(resourceInfo);
  const isAcpControlledResource = await acp3.isAcpControlled(resourceUrl, {
    fetch,
  });
  const isWacControlledResource =
    !isAcpControlledResource && hasAccessibleAcl(resourceInfo);
  if (isAcpControlledResource) {
    return ACP;
  }
  if (isWacControlledResource) {
    return WAC;
  }
  return null;
}

export default function useAccessControlType(resourceInfo) {
  const { fetch } = useSession();
  return useSWR(
    ["useAccessControlType", resourceInfo],
    async () => {
      if (!resourceInfo) return null;
      return getAccessControlType(resourceInfo, fetch);
    },
    { revalidateOnFocus: false }
  );
}
