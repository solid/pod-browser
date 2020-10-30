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

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { overwriteFile } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import PodLocationContext from "../../src/contexts/podLocationContext";
import AlertContext from "../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import { joinPath } from "../../src/stringHelpers";

const TESTCAFE_ID_UPLOAD_BUTTON = "upload-file-button";
const TESTCAFE_ID_UPLOAD_INPUT = "upload-file-input";
export const DUPLICATE_DIALOG_ID = "upload-duplicate-file";

function normalizeSafeFileName(fileName) {
  return fileName.replace(/^-/, "");
}

export function handleSaveResource({
  fetch,
  currentUri,
  onSave,
  setIsUploading,
  setAlertOpen,
  setMessage,
  setSeverity,
}) {
  return async (uploadedFile) => {
    try {
      const fileName = normalizeSafeFileName(uploadedFile.name);
      await overwriteFile(
        joinPath(currentUri, encodeURIComponent(fileName)),
        uploadedFile,
        {
          type: uploadedFile.type,
          fetch,
        }
      );

      onSave();

      setSeverity("success");
      setMessage(`Your file has been uploaded as ${fileName}`);
      setAlertOpen(true);
    } catch (error) {
      setSeverity("error");
      setMessage(error.toString());
      setAlertOpen(true);
    } finally {
      setIsUploading(false);
    }
  };
}

export function handleUploadedFile({
  setOpen,
  setTitle,
  setContent,
  setConfirmationSetup,
  setIsUploading,
  saveResource,
}) {
  return (uploadedFile, existingFile) => {
    if (existingFile) {
      setOpen(DUPLICATE_DIALOG_ID);
      setTitle(
        `File ${normalizeSafeFileName(uploadedFile.name)} already exists`
      );
      setContent(<p>Do you want to replace it?</p>);
      setConfirmationSetup(true);
      setIsUploading(false);
    } else {
      saveResource(uploadedFile);
      setIsUploading(false);
    }
  };
}

export function handleFileSelect({
  setIsUploading,
  setFile,
  saveUploadedFile,
  setSeverity,
  setMessage,
  setAlertOpen,
  resourceList,
}) {
  return (e) => {
    try {
      if (e.target.files.length) {
        setIsUploading(true);
        const [uploadedFile] = e.target.files;
        setFile(uploadedFile);
        try {
          const existingFile = !!resourceList.find(
            (file) => file.name === normalizeSafeFileName(uploadedFile.name)
          );
          saveUploadedFile(uploadedFile, existingFile);
        } catch (error) {
          setSeverity("error");
          setMessage(error.toString());
          setAlertOpen(true);
        }
      }
    } catch (error) {
      setSeverity("error");
      setMessage(error.toString());
      setAlertOpen(true);
    } finally {
      setIsUploading(false);
    }
  };
}

export function handleConfirmation({
  setOpen,
  setConfirmed,
  saveResource,
  setConfirmationSetup,
}) {
  return (confirmationSetup, confirmed, file, open) => {
    if (confirmationSetup && confirmed === null && open === DUPLICATE_DIALOG_ID)
      return;

    if (confirmationSetup && confirmed && open === DUPLICATE_DIALOG_ID) {
      saveResource(file);
    }

    if (confirmed !== null) {
      setOpen(null);
      setConfirmed(null);
      setConfirmationSetup(false);
    }
  };
}

export default function AddFileButton({ className, onSave, resourceList }) {
  const { session } = useSession();
  const { fetch } = session;
  const { currentUri } = useContext(PodLocationContext);
  const [isUploading, setIsUploading] = useState(false);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const {
    confirmed,
    open,
    setConfirmed,
    setContent,
    setOpen,
    setTitle,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const [file, setFile] = useState(null);

  const saveResource = handleSaveResource({
    fetch,
    currentUri,
    onSave,
    setIsUploading,
    setAlertOpen,
    setMessage,
    setSeverity,
  });

  const saveUploadedFile = handleUploadedFile({
    setOpen,
    setTitle,
    setContent,
    setConfirmationSetup,
    setIsUploading,
    saveResource,
  });

  const onFileSelect = handleFileSelect({
    fetch,
    currentUri,
    setIsUploading,
    setFile,
    saveUploadedFile,
    saveResource,
    setSeverity,
    setMessage,
    setAlertOpen,
    resourceList,
  });

  const onConfirmation = handleConfirmation({
    setOpen,
    setConfirmed,
    saveResource,
    setConfirmationSetup,
    open,
  });

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed, file, open);
  }, [confirmationSetup, confirmed, onConfirmation, file, open]);

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-testid={TESTCAFE_ID_UPLOAD_BUTTON}
      disabled={isUploading}
      className={className}
    >
      {isUploading ? "Uploading..." : "Upload File"}
      <input
        data-testid={TESTCAFE_ID_UPLOAD_INPUT}
        type="file"
        style={{ display: "none" }}
        onClick={(e) => {
          e.target.value = null;
        }}
        onChange={onFileSelect}
      />
    </label>
  );
}

AddFileButton.propTypes = {
  className: T.string,
  onSave: T.func,
  resourceList: T.arrayOf(T.shape),
};

AddFileButton.defaultProps = {
  className: null,
  onSave: () => {},
  resourceList: [],
};
