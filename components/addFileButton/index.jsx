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

import { useContext, useState, useEffect } from "react";
import T from "prop-types";
import { overwriteFile, fetchResourceInfoWithAcl } from "@inrupt/solid-client";
import { Button } from "@material-ui/core";
import SessionContext from "../../src/contexts/sessionContext";
import PodLocationContext from "../../src/contexts/podLocationContext";
import AlertContext from "../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";

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
      const response = await overwriteFile(
        currentUri + encodeURIComponent(uploadedFile.name),
        uploadedFile,
        {
          type: uploadedFile.type,
          fetch,
        }
      );

      onSave();

      setSeverity("success");
      setMessage(
        `Your file has been saved to ${decodeURIComponent(
          response.internal_resourceInfo.sourceIri
        )}`
      );
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

export async function findExistingFile(path, filename, options) {
  try {
    return await fetchResourceInfoWithAcl(path + filename, options);
  } catch (error) {
    // The error object should include a status code, in the meantime we are extracting the error type from the message string
    if (error.message.includes("404")) {
      return false;
    }
    throw error;
  }
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
      setOpen(true);
      setTitle(`File ${uploadedFile.name} already exists`);
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
  fetch,
  currentUri,
  setIsUploading,
  setFile,
  findFile,
  saveUploadedFile,
  setSeverity,
  setMessage,
  setAlertOpen,
}) {
  return async (e) => {
    try {
      if (e.target.files.length) {
        setIsUploading(true);
        const [uploadedFile] = e.target.files;
        setFile(uploadedFile);
        try {
          const existingFile = await findFile(currentUri, uploadedFile.name, {
            fetch,
          });
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
  return (confirmationSetup, confirmed, file) => {
    if (confirmationSetup && !confirmed) return;

    if (confirmationSetup && confirmed) {
      setOpen(false);
      setConfirmed(false);
      setConfirmationSetup(false);
      saveResource(file);
    }
  };
}

export default function AddFileButton({ onSave }) {
  const { session } = useContext(SessionContext);
  const { fetch } = session;
  const { currentUri } = useContext(PodLocationContext);
  const [isUploading, setIsUploading] = useState(false);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const { confirmed, setConfirmed, setContent, setOpen, setTitle } = useContext(
    ConfirmationDialogContext
  );
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const [file, setFile] = useState(null);
  const findFile = findExistingFile;

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
    findFile,
    saveUploadedFile,
    saveResource,
    setSeverity,
    setMessage,
    setAlertOpen,
  });

  const onConfirmation = handleConfirmation({
    setOpen,
    setConfirmed,
    saveResource,
    setConfirmationSetup,
  });

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed, file);
  }, [confirmationSetup, confirmed, onConfirmation, file]);

  return (
    <Button
      variant="contained"
      component="label"
      type="submit"
      color="primary"
      disabled={isUploading}
    >
      {isUploading ? "Uploading..." : "Upload File"}
      <input
        type="file"
        style={{ display: "none" }}
        onClick={(e) => {
          e.target.value = null;
        }}
        onChange={onFileSelect}
      />
    </Button>
  );
}

AddFileButton.propTypes = {
  onSave: T.func,
};

AddFileButton.defaultProps = {
  onSave: () => {},
};
