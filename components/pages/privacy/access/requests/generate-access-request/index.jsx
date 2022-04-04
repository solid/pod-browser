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
import { useSession } from "@inrupt/solid-ui-react";
import {
  issueAccessRequest,
  redirectToAccessManagementUi,
} from "@inrupt/solid-client-access-grants";
import useFetchProfile from "../../../../../../src/hooks/useFetchProfile";
import Spinner from "../../../../../spinner";

export default function GenerateAccessRequest() {
  const { session } = useSession();
  const { fetch } = session;
  const options = { fetch };
  const [resources, setResources] = useState([]);
  const [owner, setOwner] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [resource, setResource] = useState([]);
  const { data: profile } = useFetchProfile(session.info.webId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  async function generateRequest(e) {
    e.preventDefault();
    if (!profile) return;
    const vc = await issueAccessRequest({
      requestor: session.info.webId,
      resourceOwner: owner,
      access: { read: true },
      resources,
      purpose: "https://example.org/someSpecificPurpose",
      requestorInboxUrl: profile.inbox ?? session.info.webId, // FIXME: should Pods have a default inbox? in the meantime, using WebID if inbox not available
      options,
    });
    if (vc && origin) {
      redirectToAccessManagementUi(
        vc,
        `${origin}/privacy/?signedVcUrl=${encodeURIComponent(vc.id)}`,
        {
          fallbackAccessManagementUi: `${origin}/privacy/access/requests/`,
        }
      );
    }
  }

  const handleSetOwner = (e) => {
    setOwner(e.target.value);
  };

  const handleSetResource = (e) => {
    setResource(e.target.value);
  };

  if (!profile) return <Spinner />;

  return (
    <>
      <form
        onSubmit={generateRequest}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "max-content",
        }}
      >
        Generate access request
        <label htmlFor="owner">
          Resource Owner WebID:
          <input
            name="owner"
            type="url"
            value={owner}
            onChange={handleSetOwner}
          />
        </label>
        <label htmlFor="resource">
          Add resources to request:
          <input
            name="owner"
            type="url"
            value={resource}
            onChange={handleSetResource}
          />
          <button
            type="button"
            onClick={() => setResources([...resources, resource])}
          >
            Add
          </button>
        </label>
        <div>
          {resources.map((url) => (
            <span>{url}</span>
          ))}
        </div>
        <button type="submit">Generate access request</button>
      </form>
    </>
  );
}
