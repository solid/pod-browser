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

/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

import React from "react";
import T from "prop-types";
import { foaf, vcard, rdf } from "rdf-namespaces";
import Link from "next/link";
import { getUrl } from "@inrupt/solid-client";
import { Avatar, Box, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Text, Image, useThing } from "@inrupt/solid-ui-react";
import {
  buildResourcesLink,
  isPerson,
} from "../../../../../../agentResourceAccessLink";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";

export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}

export default function ModalAvatar({ profileIri, closeDialog }) {
  const classes = useStyles();
  const bem = useBem(classes);
  const errorComponent = setupErrorComponent(bem);
  const { thing } = useThing();

  const type = getUrl(thing, rdf.type);
  const path = isPerson(type) ? "person" : "app";

  return (
    <Box alignItems="center" display="flex">
      <Box>
        <Avatar className={classes.avatar}>
          <Image
            property={vcard.hasPhoto}
            width={120}
            errorComponent={errorComponent}
          />
        </Avatar>
      </Box>

      <Box p={2}>
        <Link href={buildResourcesLink(profileIri, "/privacy", path)}>
          <a role="link" onClick={() => closeDialog()}>
            <h3 data-testid={TESTCAFE_ID_NAME_TITLE}>
              <Text className={classes.avatarText} property={foaf.name} />
            </h3>
          </a>
        </Link>
      </Box>
    </Box>
  );
}

ModalAvatar.propTypes = {
  profileIri: T.string.isRequired,
  closeDialog: T.func.isRequired,
};
