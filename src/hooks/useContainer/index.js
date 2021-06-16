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

import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { getContainerUrl } from "../../stringHelpers";
import { getContainer } from "../../models/container";

export default function useContainer(iri) {
  const { fetch } = useSession();
  const url = getContainerUrl(iri);
  const [container, setContainer] = useState(null);
  const [containerError, setContainerError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!url) return;
    async function fetchContainer() {
      setIsFetching(true);
      try {
        const initialData = await getContainer(url, { fetch });
        setContainer(initialData);
        setContainerError(null);
        setIsFetching(false);
      } catch (e) {
        setContainer(null);
        setContainerError(e);
        setIsFetching(false);
      }
    }
    fetchContainer();
  }, [url, fetch]);

  async function update(deletingCurrentContainer = false) {
    setIsFetching(true);
    try {
      const updatedContainer = await getContainer(url, { fetch });
      setContainer(updatedContainer);
      setContainerError(null);
      setIsFetching(false);
    } catch (e) {
      if (!deletingCurrentContainer) {
        setContainerError(e);
      } else {
        setContainerError(null);
      }
      setContainer(null);
      setIsFetching(false);
    }
  }

  return {
    data: container,
    error: containerError,
    update,
    isFetching,
  };
}
