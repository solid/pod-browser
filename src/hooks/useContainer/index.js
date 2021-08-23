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

import useSWR from "swr";
import { useSession } from "@inrupt/solid-ui-react";
import { getContainerUrl } from "../../stringHelpers";
import { getContainer } from "../../models/container";

export default function useContainer(iri) {
  const session = useSession();
  const { sessionRequestInProgress } = session;
  const url = getContainerUrl(iri);

  async function fetchContainer(fetch) {
    return getContainer(url, { fetch });
  }

  return useSWR(
    ["container", url, sessionRequestInProgress],
    async () => {
      if (!url || sessionRequestInProgress) return null;
      return fetchContainer(session.fetch);
    },
    { revalidateOnFocus: false, refreshInterval: 0, errorRetryInterval: 2000 }
  );
}
