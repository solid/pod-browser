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
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useState, useEffect, useCallback } from "react";

import T from "prop-types";
import { foaf, vcard } from "rdf-namespaces";
import { Avatar, Box, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Text,
  Image,
  useSession,
  useThing,
  DatasetContext,
} from "@inrupt/solid-ui-react";
import { getUrl } from "@inrupt/solid-client";
import { Close, CloudUpload } from "@material-ui/icons";
import ConfirmationDialog from "../../confirmationDialog";
import ConfirmationDialogContext from "../../../src/contexts/confirmationDialogContext";
import { getParentContainerUrl } from "../../../src/stringHelpers";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_UPLOAD_IMAGE = "profile-upload-image";
export const TESTCAFE_ID_REMOVE_IMAGE = "profile-remove-image";

export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}
const confirmationDialogTitle = "Delete profile picture";
export default function PersonAvatar({ profileIri }) {
  const saveLocation = getParentContainerUrl(profileIri);
  const { thing } = useThing(profileIri);
  const { solidDataset: dataset } = useContext(DatasetContext);
  const classes = useStyles();
  const bem = useBem(classes);
  const errorComponent = setupErrorComponent(bem);
  const { session } = useSession();
  const [profileImage, setProfileImage] = useState(null);
  const { confirmed, setOpen, closeDialog, setTitle } = useContext(
    ConfirmationDialogContext
  );
  const [deletePhotoFunction, setDeletePhotoFunction] = useState(null);

  const getPicture = useCallback(() => {
    const picture = getUrl(thing, vcard.hasPhoto);
    setProfileImage(picture);
  }, [thing]);

  useEffect(() => {
    getPicture();
  }, [getPicture]);

  useEffect(() => {
    if (confirmed && deletePhotoFunction) {
      // const deleteComplete = async () =>  deletePhotoFunction();
      // deleteComplete().then(() => {
      closeDialog();
      // setProfileImage(null);
      // });
    }
    if (confirmed === false) {
      closeDialog();
    }
  }, [confirmed, deletePhotoFunction, closeDialog]);

  const openDeleteConfirmationDialog = (deleteFunction) => {
    setTitle(confirmationDialogTitle);
    setOpen(true);
    if (!deletePhotoFunction) setDeletePhotoFunction(deleteFunction);
  };

  const deleteComponent = (onClickFunc) => (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={classes.labelContainer}
      onClick={() => openDeleteConfirmationDialog(onClickFunc)}
    >
      <Close className={classes.removeIcon} />
      <label
        className={classes.inputLabelRemove}
        data-testid={TESTCAFE_ID_REMOVE_IMAGE}
      >
        Remove Photo
      </label>
      <ConfirmationDialog />
    </div>
  );

  return (
    <Box alignItems="center" display="flex">
      <Box>
        {profileImage ? (
          <>
            <Image
              inputProps={{
                className: classes.avatarInput,
                id: "picture-upload-input-label",
              }}
              className={classes.avatar}
              width={120}
              thing={thing}
              solidDataset={dataset}
              saveLocation={saveLocation}
              property={vcard.hasPhoto}
              alt={profileIri}
              errorComponent={errorComponent}
              deleteComponent={({ onClick }) => deleteComponent(onClick)}
              onSave={getPicture}
              allowDelete
              autosave
              edit
            />
            <div className={classes.labelContainer}>
              <CloudUpload className={classes.uploadIcon} />
              <label
                htmlFor="picture-upload-input-label"
                className={classes.inputLabelUpload}
                data-testid={TESTCAFE_ID_UPLOAD_IMAGE}
              >
                Change Photo
              </label>
            </div>
          </>
        ) : (
          <>
            <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
            <Image
              inputProps={{
                className: classes.avatarInput,
                id: "picture-upload-input-label",
              }}
              className={classes.avatar}
              thing={thing}
              solidDataset={dataset}
              saveLocation={saveLocation}
              property={vcard.hasPhoto}
              width={120}
              alt={profileIri}
              errorComponent={errorComponent}
              onSave={getPicture}
              autosave
              edit
            />
            <div className={classes.labelContainer}>
              <CloudUpload className={classes.uploadIcon} />
              <label
                htmlFor="picture-upload-input-label"
                className={classes.inputLabelUpload}
                data-testid={TESTCAFE_ID_UPLOAD_IMAGE}
              >
                Upload Photo
              </label>
            </div>
          </>
        )}
      </Box>

      <Box p={2}>
        <h3 data-testid={TESTCAFE_ID_NAME_TITLE}>
          <Text className={classes.avatarText} property={foaf.name} />
          <a
            className={classes.headerLink}
            href={profileIri}
            rel="noreferrer"
            target="_blank"
          >
            {session.info.webId}
          </a>
        </h3>
      </Box>
    </Box>
  );
}

PersonAvatar.propTypes = {
  profileIri: T.string.isRequired,
};
