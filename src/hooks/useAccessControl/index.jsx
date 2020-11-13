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

import { useEffect, useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { getAccessControl } from "../../accessControl";
import usePoliciesContainer from "../usePoliciesContainer";

export default function useAccessControl(resourceInfo) {
  const { fetch } = useSession();
  const [accessControl, setAccessControl] = useState(null);
  const { policiesContainer, error: policiesError } = usePoliciesContainer();
  const [error, setError] = useState(policiesError || null);

  useEffect(() => {
    if (!resourceInfo || policiesError) {
      setAccessControl(null);
      setError(policiesError || null);
      return;
    }
    setAccessControl(null);
    setError(null);
    getAccessControl(resourceInfo, policiesContainer, fetch)
      .then((response) => {
        setAccessControl(response);
        setError(null);
      })
      .catch((accessControlError) => {
        setAccessControl(null);
        setError(accessControlError);
      });
  }, [fetch, policiesContainer, policiesError, resourceInfo]);

  return { accessControl, error };
}
