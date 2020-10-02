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
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useRouter } from "next/router";
import { useBem } from "@solid/lit-prism-patterns";
import { foaf, vcard } from "rdf-namespaces";
import { getStringNoLocale } from "@inrupt/solid-client";
import usePodOwnerProfile from "../../../src/hooks/usePodOwnerProfile";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function PodIndicator() {
  const classes = useStyles();
  const router = useRouter();
  const bem = useBem(useStyles());
  const decodedResourceUri = decodeURIComponent(router.query.iri);
  const [podUri, setPodUri] = useState();

  useEffect(() => {
    if (decodedResourceUri === "undefined") {
      return;
    }
    const originUri = decodedResourceUri && new URL(decodedResourceUri).origin;
    const decodedPodUri = decodeURIComponent(originUri);
    setPodUri(decodedPodUri);
  }, [decodedResourceUri]);

  const { profile: podOwner } = usePodOwnerProfile(podUri);
  if (!podOwner) {
    return null;
  }

  const podOwnerName =
    getStringNoLocale(podOwner.dataset, vcard.fn) ||
    getStringNoLocale(podOwner.dataset, foaf.name);

  return (
    <div className={classes.indicator}>
      <label htmlFor="pod-indicator-prompt" className={classes.indicatorLabel}>
        <span>Pod: </span>
        <button
          data-testid="pod-indicator-prompt"
          type="button"
          className={clsx(bem("button", "prompt"), classes.indicatorPrompt)}
        >
          {podOwnerName}
        </button>
      </label>
    </div>
  );
}
