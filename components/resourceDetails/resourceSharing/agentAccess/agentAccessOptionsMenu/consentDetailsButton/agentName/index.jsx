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
  getPodUrlAll,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import AlertContext from "../../../../../../../src/contexts/alertContext";

export const TESTCAFE_ID_AGENT_NAME_LINK = "agent-name-link";
export default function AgentName({ agentWebId, className, link }) {
  const { thing } = useThing();
  const name = thing && getStringNoLocale(thing, foaf.name);
  return (
    <>
      {link ? (
        <a
          target="_blank"
          href={agentWebId}
          rel="noopener noreferrer"
          data-testid={TESTCAFE_ID_AGENT_NAME_LINK}
        >
          <h3 className={className}>{name || agentWebId}</h3>
        </a>
      ) : (
        <span className={className}> {name || agentWebId} </span>
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
