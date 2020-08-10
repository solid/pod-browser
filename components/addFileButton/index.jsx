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

import { useContext, useState } from "react";
import T from "prop-types";
import { saveFileInContainer } from "@inrupt/solid-client";
import { Button } from "@material-ui/core";
import PodLocationContext from "../../src/contexts/podLocationContext";
import SessionContext from "../../src/contexts/sessionContext";
import AlertContext from "../../src/contexts/alertContext";

export default function AddFileButton({ onSave }) {
  const { currentUri } = useContext(PodLocationContext);
  const { session } = useContext(SessionContext);
  const [isUploading, setIsUploading] = useState(false);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);

  const onFileSelect = async (e) => {
    if (e.target.files.length) {
      setIsUploading(true);

      const [file] = e.target.files;

      try {
        const response = await saveFileInContainer(currentUri, file, {
          fetch: session.fetch,
          slug: file.name,
        });

        onSave();

        setSeverity("success");
        setMessage(
          `Your file has been saved to ${response.internal_resourceInfo.sourceIri}`
        );
        setAlertOpen(true);
      } catch (error) {
        setSeverity("error");
        setMessage(error.toString());
        setAlertOpen(true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Button
      variant="contained"
      component="label"
      type="submit"
      color="primary"
      disabled={isUploading}
    >
      {isUploading ? "Uploading..." : "Upload File"}
      <input type="file" style={{ display: "none" }} onChange={onFileSelect} />
    </Button>
  );
}

AddFileButton.propTypes = {
  onSave: T.func,
};

AddFileButton.defaultProps = {
  onSave: () => {},
};
