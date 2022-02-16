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

/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import {
  getProfileAll,
  getStringNoLocale,
  getResourceInfoWithAcr,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { useSession } from "@inrupt/solid-ui-react";
import AlertContext from "../../../../../../../src/contexts/alertContext";

export const TESTCAFE_ID_AGENT_NAME_LINK = "agent-name-link";
export default function AgentName({ agentWebId, className, link }) {
  const [text, setText] = useState(agentWebId);
  const { setMessage, setSeverity } = useContext(AlertContext);
  const {
    session: { fetch },
  } = useSession();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileAll(agentWebId, { fetch });
        console.log({ res });
        const acr = getResourceInfoWithAcr(
          "https://storage.dev-next.inrupt.com/4a198ba3-f7f1-4631-9686-0d09f200c758/profile"
        );
        console.log({ acr });
        if (res) {
          setText(
            getStringNoLocale(res, foaf.name) ||
              getStringNoLocale(res, vcard.fn) ||
              agentWebId
          );
        }
      } catch (error) {
        console.log({ error });
        setSeverity("error");
        setMessage(error.toString());
      }
    };
    fetchProfile();
  }, [agentWebId, setMessage, setSeverity, fetch]);

  return (
    <>
      {link ? (
        <a
          target="_blank"
          href={agentWebId}
          rel="noopener noreferrer"
          data-testid={TESTCAFE_ID_AGENT_NAME_LINK}
        >
          <h3 className={className}>{text}</h3>
        </a>
      ) : (
        <span className={className}> {text} </span>
      )}
    </>
  );
}

AgentName.propTypes = {
  agentWebId: T.string.isRequired,
  className: T.string,
  link: T.bool,
};

AgentName.defaultProps = {
  className: null,
  link: false,
};
