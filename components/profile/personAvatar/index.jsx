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

import React from "react";
import T from "prop-types";
import { vcard } from "rdf-namespaces";
import { Avatar, Box, createStyles, Typography } from "@mui/core";
import { makeStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Image } from "@inrupt/solid-ui-react";
import { getSourceUrl, getThing } from "@inrupt/solid-client";
import styles from "./styles";
import { profilePropTypes } from "../../../constants/propTypes";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_WEBID_TITLE = "profile-webid-title";

export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}

export default function PersonAvatar({
  profile,
  profileDataset,
  editing,
  webId,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const errorComponent = setupErrorComponent(bem);
  const thing =
    profileDataset && getThing(profileDataset, getSourceUrl(profileDataset));
  const name = profile?.names[0];

  if (!profile && !profileDataset) {
    return (
      <Box p={2}>
        <Typography variant="h1" data-testid={TESTCAFE_ID_WEBID_TITLE}>
          {webId}
        </Typography>
      </Box>
    );
  }

  return (
    <Box alignItems="center" display="flex">
      <Box>
        <Avatar className={classes.avatar}>
          {editing ? (
            <Image
              property={vcard.hasPhoto}
              width={120}
              alt={profile.webId}
              errorComponent={errorComponent}
            />
          ) : (
            <Avatar
              src={profile.avatars[0]}
              alt={profile.webId}
              fallback={bem("avatar")}
            />
          )}
        </Avatar>
      </Box>

      <Box p={2}>
        {profile || profileDataset ? (
          <>
            <Typography variant="h1" data-testid={TESTCAFE_ID_NAME_TITLE}>
              {name}
            </Typography>
            <Typography variant="body2" data-testid={TESTCAFE_ID_WEBID_TITLE}>
              {profile.webId}
            </Typography>
          </>
        ) : (
          <Typography variant="h1" data-testid={TESTCAFE_ID_WEBID_TITLE}>
            {profile.webId}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

PersonAvatar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  profileDataset: T.object,
  profile: profilePropTypes,
  editing: T.bool,
  webId: T.string,
};

PersonAvatar.defaultProps = {
  profileDataset: null,
  profile: null,
  editing: false,
  webId: null,
};
