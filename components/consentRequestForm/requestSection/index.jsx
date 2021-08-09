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

import React, { useState, useEffect } from "react";
import T from "prop-types";
import { Icons, Button } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import {
  createStyles,
  Typography,
  FormGroup,
  FormControl,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { getPolicyDetailFromAccess } from "../../../src/accessControl/acp";
import styles from "../styles";

export const TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON = "request-select-all";
export const TESTCAFE_ID_REQUEST_EXPAND_SECTION_BUTTON = "expand-section";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const ResourceSwitch = (props) => {
  const { resourceIri, isChecked, handleOnChange, index } = props;
  const bem = useBem(useStyles());

  return (
    <FormControlLabel
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      value={resourceIri}
      // eslint-disable-next-line prettier/prettier
      control={(
        <Switch
          checked={isChecked[index]}
          onChange={() => handleOnChange(index)}
          color="primary"
        />
        // eslint-disable-next-line prettier/prettier
      )}
      label={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <Typography variant="body2">
          <Icons name="file" className={bem("icon-small", "dark")} />
          {resourceIri}
        </Typography>
      }
      labelPlacement="start"
      className={bem("box__content")}
    />
  );
};

ResourceSwitch.propTypes = {
  resourceIri: T.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  isChecked: T.array.isRequired,
  handleOnChange: T.func.isRequired,
  index: T.number.isRequired,
};

const renderSwitch = (
  resourceIri,
  index,
  isChecked,
  handleOnChange,
  overrideCheck = false
) => {
  // FIXME replace this with an actual solid-client isContainer check
  // for each resource check isContainer, and if true set flag and pass custom switch
  // to retrieve subsequent resources using getContainedResourceUrlAll
  // list them all while checkking if any of them are also containers
  const isContainer = resourceIri.slice(-1) === "/"; // temp way to detect folders vs resources

  if (isContainer) {
    return (
      <ContainerSwitch
        key={index}
        resourceIri={resourceIri}
        isChecked={isChecked}
        handleOnChange={handleOnChange}
        index={index}
        overrideCheck={overrideCheck}
      />
    );
  }
  return (
    <ResourceSwitch
      key={index}
      resourceIri={resourceIri}
      isChecked={isChecked}
      handleOnChange={handleOnChange}
      index={index}
    />
  );
};

const RequestSubSection = (props) => {
  const { resourceIri, overrideCheck } = props;

  // FIXME based on the resourceIri retrieve all resources in this container and replace the mock list below
  const mockedResources = [
    "https://pod.inrupt.com/alice/private/data4",
    "https://pod.inrupt.com/alice/private/data5",
    resourceIri,
  ];

  const [isChecked, setIsChecked] = useState(
    new Array(mockedResources.length).fill(false)
  );

  const toggleAllSwitches = () => {
    const updatedAllCheckedState = isChecked.map(() => overrideCheck);
    setIsChecked(updatedAllCheckedState);
  };

  useEffect(() => {
    toggleAllSwitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideCheck]);

  const handleOnChange = (position) => {
    const updatedCheckedState = isChecked.map((item, index) =>
      index === position ? !item : item
    );

    setIsChecked(updatedCheckedState);
  };

  return (
    <>
      {mockedResources.map((containerResourceIri, index) => {
        return renderSwitch(
          containerResourceIri,
          index,
          isChecked,
          handleOnChange,
          overrideCheck
        );
      })}
    </>
  );
};

RequestSubSection.defaultProps = {
  overrideCheck: false,
};

RequestSubSection.propTypes = {
  resourceIri: T.string.isRequired,
  overrideCheck: T.bool,
};

const ContainerSwitch = (props) => {
  const {
    resourceIri,
    isChecked,
    handleOnChange,
    index,
    overrideCheck,
  } = props;
  const bem = useBem(useStyles());
  const [isExpanded, setIsExpanded] = useState(false);
  const [containerChecked, setContainerChecked] = useState(overrideCheck);

  useEffect(() => {
    setContainerChecked(overrideCheck);
  }, [overrideCheck, isChecked]);

  return (
    <>
      <FormControlLabel
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        value={resourceIri}
        // eslint-disable-next-line prettier/prettier
        control={(
          <Switch
            checked={isChecked[index]}
            onChange={() => {
              handleOnChange(index);
              setContainerChecked(!containerChecked);
            }}
            color="primary"
          />
          // eslint-disable-next-line prettier/prettier
        )}
        label={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Typography variant="body2">
            <Icons name="folder" className={bem("icon-small", "dark")} />
            {resourceIri}
            <button
              data-testid={TESTCAFE_ID_REQUEST_EXPAND_SECTION_BUTTON}
              type="button"
              className={bem("dropdown-caret")}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icons
                name={isExpanded ? "caret-up" : "caret-down"}
                className={bem("icon-small--padded")}
              />
            </button>
          </Typography>
        }
        labelPlacement="start"
        className={bem("box__content")}
      />
      {isExpanded && (
        <div className={bem("full-width", "padded-left")}>
          <RequestSubSection
            resourceIri={resourceIri}
            overrideCheck={isChecked[index]}
          />
        </div>
      )}
    </>
  );
};

ContainerSwitch.propTypes = {
  resourceIri: T.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  isChecked: T.array.isRequired,
  overrideCheck: T.bool,
  handleOnChange: T.func.isRequired,
  index: T.number.isRequired,
};

ContainerSwitch.defaultProps = {
  overrideCheck: false,
};
export default function RequestSection(props) {
  const { agentName, sectionDetails } = props;
  const bem = useBem(useStyles());

  const [isChecked, setIsChecked] = useState(
    new Array(sectionDetails.forPersonalData.length).fill(false)
  );

  const modesObject = {
    read: sectionDetails.mode.some((el) => el === "Read"),
    write: sectionDetails.mode.some((el) => el === "Write"),
    append: sectionDetails.mode.some((el) => el === "Append"),
  };

  const toggleAllSwitches = () => {
    const updatedAllCheckedState = isChecked.map(() => true);
    setIsChecked(updatedAllCheckedState);
  };

  const handleOnChange = (position) => {
    const updatedCheckedState = isChecked.map((item, index) =>
      index === position ? !item : item
    );
    setIsChecked(updatedCheckedState);
  };

  return (
    <>
      <FormControl
        component="fieldset"
        className={bem("request-container__section")}
      >
        <legend className={bem("request-container__header-text", "small")}>
          <Icons
            name={getPolicyDetailFromAccess(modesObject, "iconName")}
            className={bem("icon-small")}
          />
          <span className={bem("header__content")}>
            {`${agentName} ${getPolicyDetailFromAccess(
              modesObject,
              "titleConsent"
            )}`}
          </span>
          <Button
            data-testid={TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON}
            variant="secondary"
            type="button"
            onClick={toggleAllSwitches}
            className={bem("request-container__button", "small")}
          >
            <Typography component="span" variant="caption">
              Select all
            </Typography>
          </Button>
        </legend>
        <FormGroup
          aria-label="position"
          row
          className={bem("request-container__section", "box")}
        >
          {sectionDetails.forPersonalData &&
            sectionDetails.forPersonalData.map((resourceIri, index) => {
              return renderSwitch(
                resourceIri,
                index,
                isChecked,
                handleOnChange
              );
            })}
        </FormGroup>
      </FormControl>
    </>
  );
}

RequestSection.propTypes = {
  agentName: T.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  sectionDetails: T.object.isRequired,
};
