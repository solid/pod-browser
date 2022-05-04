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

import React, { useState, useEffect, useMemo } from "react";
import T from "prop-types";
import { Icons, Button } from "@inrupt/prism-react-components";
import { getSourceUrl } from "@inrupt/solid-client";
import { makeStyles } from "@material-ui/styles";
import {
  createStyles,
  Typography,
  FormGroup,
  FormControl,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { getPolicyDetailFromAccess } from "../../../src/accessControl/acp";
import styles from "../styles";
import {
  isContainerIri,
  uniqueObjects,
} from "../../../src/solidClientHelpers/utils";
import {
  getAccessMode,
  getRequestedResourcesIris,
} from "../../../src/models/access/request";
import { getResourceName } from "../../../src/solidClientHelpers/resource";
import Spinner from "../../spinner";
import useContainer from "../../../src/hooks/useContainer";
import { getContainerResourceUrlAll } from "../../../src/models/container";

export const TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON = "request-select-all";
export const TESTCAFE_ID_REQUEST_EXPAND_SECTION_BUTTON = "expand-section";
export const TESTCAFE_ID_ACCESS_SWITCH = "access-switch";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const removeExistingValues = (prevAccesses, newAccesses) => {
  const withDeletedAccesses = prevAccesses?.map((item, i) => {
    const shouldBeRemoved = [];
    newAccesses.forEach((a) => {
      if (
        JSON.stringify(item.accessModes) === JSON.stringify(a.accessModes) &&
        item.index === a.index &&
        item.resourceIri === a.resourceIri &&
        a.checked === false
      ) {
        shouldBeRemoved.push(i);
      }
    });
    if (!shouldBeRemoved.includes(i)) {
      return item;
    }
    return null;
  });
  const previousAccess = withDeletedAccesses?.filter(
    (item) => !!item && item.checked === true
  );
  const checkedAccesses = newAccesses.filter(({ checked }) => checked);
  return uniqueObjects(
    previousAccess
      ? [...previousAccess, ...checkedAccesses]
      : [...checkedAccesses]
  );
};

const ResourceSwitch = (props) => {
  const { resourceIri, isChecked, handleOnChange, index } = props;
  const bem = useBem(useStyles());

  return (
    <FormControlLabel
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      value={resourceIri}
      // eslint-disable-next-line prettier/prettier
      control={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <Switch
          checked={isChecked[index] ?? false}
          onChange={() => handleOnChange(index)}
          color="primary"
        />
        // eslint-disable-next-line prettier/prettier
      }
      label={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <Typography variant="body2">
          <Icons name="file" className={bem("icon-small", "dark")} />
          <Tooltip title={resourceIri} arrow>
            <span>{getResourceName(resourceIri)}</span>
          </Tooltip>
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
  overrideCheck = false,
  setSelectedAccess,
  modesObject
) => {
  if (isContainerIri(resourceIri)) {
    return (
      <ContainerSwitch
        key={index}
        resourceIri={resourceIri}
        isChecked={isChecked}
        handleOnChange={() => handleOnChange(index)}
        index={index}
        overrideCheck={overrideCheck}
        setSelectedAccess={setSelectedAccess}
        modesObject={modesObject}
      />
    );
  }
  return (
    <ResourceSwitch
      key={index}
      resourceIri={resourceIri}
      isChecked={isChecked}
      handleOnChange={() => handleOnChange(index)}
      index={index}
      setSelectedAccess={setSelectedAccess}
      modesObject={modesObject}
    />
  );
};

const RequestSubSection = (props) => {
  const { resourceIri, overrideCheck, modesObject, setSelectedAccess } = props;
  const { data: container, isValidating } = useContainer(resourceIri);
  const [resourcesIris, setResourcesIris] = useState([]);
  const [isChecked, setIsChecked] = useState(
    new Array((resourcesIris || []).length).fill(false)
  );

  useEffect(() => {
    if (
      !resourceIri ||
      (container &&
        isContainerIri(resourceIri) &&
        getSourceUrl(container.dataset) !== resourceIri)
    )
      return;
    const urls = container && getContainerResourceUrlAll(container);
    setResourcesIris(urls);
  }, [container, resourceIri]);

  useEffect(() => {
    setIsChecked(new Array((resourcesIris || []).length).fill(false));
  }, [resourcesIris]);

  const toggleAllSwitches = () => {
    const updatedAllCheckedState = isChecked.map(() => overrideCheck);
    setIsChecked(updatedAllCheckedState);
  };

  useEffect(() => {
    toggleAllSwitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideCheck]);

  useEffect(() => {
    const accesses = isChecked.map((checked, index) => {
      return {
        checked,
        accessModes: modesObject,
        resourceIri,
        index,
      };
    });
    setSelectedAccess((prevState) => removeExistingValues(prevState, accesses));
  }, [modesObject, isChecked, setSelectedAccess, resourceIri]);

  const handleOnChange = (position) => {
    const updatedCheckedState = isChecked.map((item, index) => {
      return index === position ? !item : item;
    });

    setIsChecked(updatedCheckedState);
  };

  if (!resourcesIris || isValidating) return <Spinner />;

  return (
    <>
      {resourcesIris?.map((containerResourceIri, index) => {
        return renderSwitch(
          containerResourceIri,
          index,
          isChecked,
          handleOnChange,
          overrideCheck,
          setSelectedAccess,
          modesObject,
          resourcesIris.length
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
  modesObject: T.shape({
    write: T.bool,
    read: T.bool,
    append: T.bool,
    control: T.bool,
  }).isRequired,
  setSelectedAccess: T.func.isRequired,
};

const ContainerSwitch = (props) => {
  const {
    resourceIri,
    isChecked,
    handleOnChange,
    index,
    overrideCheck,
    setSelectedAccess,
    modesObject,
    length,
  } = props;
  const bem = useBem(useStyles());
  const [isExpanded, setIsExpanded] = useState(false);
  const [containerChecked, setContainerChecked] = useState(overrideCheck);
  const { data: container, isValidating } = useContainer(resourceIri);
  const [resourcesIris, setResourcesIris] = useState(null);

  useEffect(() => {
    if (
      !resourceIri ||
      (container &&
        isContainerIri(resourceIri) &&
        getSourceUrl(container.dataset) !== resourceIri)
    )
      return;
    const urls = container && getContainerResourceUrlAll(container);
    setResourcesIris(urls || []);
  }, [container, resourceIri]);

  useEffect(() => {
    setContainerChecked(overrideCheck);
  }, [overrideCheck, isChecked]);

  if (!resourcesIris || isValidating) return <Spinner />;

  return (
    <>
      <FormControlLabel
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        value={resourceIri}
        // eslint-disable-next-line prettier/prettier
        control={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Switch
            checked={isChecked[index] ?? false}
            onChange={() => {
              handleOnChange(index);
              setContainerChecked(!containerChecked);
            }}
            inputProps={{
              "data-testid": TESTCAFE_ID_ACCESS_SWITCH,
            }}
            color="primary"
          />
          // eslint-disable-next-line prettier/prettier
        }
        label={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Typography variant="body2">
            <Icons name="folder" className={bem("icon-small", "dark")} />
            <Tooltip title={resourceIri} arrow>
              <span>{getResourceName(resourceIri)}</span>
            </Tooltip>
            {(length > 0 || resourcesIris.length > 0) && (
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
            )}
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
            setSelectedAccess={setSelectedAccess}
            modesObject={modesObject}
          />
        </div>
      )}
    </>
  );
};

ContainerSwitch.propTypes = {
  resourceIri: T.string.isRequired,
  length: T.number,
  isChecked: T.arrayOf(T.bool).isRequired,
  overrideCheck: T.bool,
  handleOnChange: T.func.isRequired,
  index: T.number.isRequired,
  modesObject: T.shape({
    write: T.bool,
    read: T.bool,
    append: T.bool,
    control: T.bool,
  }).isRequired,
  setSelectedAccess: T.func.isRequired,
};

ContainerSwitch.defaultProps = {
  overrideCheck: false,
  length: null,
};
export default function RequestSection(props) {
  const { agentName, sectionDetails, setSelectedAccess } = props;
  const requestedResourcesIris =
    sectionDetails && getRequestedResourcesIris(sectionDetails);
  const accessMode = sectionDetails && getAccessMode(sectionDetails);
  const bem = useBem(useStyles());
  const [isChecked, setIsChecked] = useState([]);

  const [allTogglesSelected, setAllTogglesSelected] = useState(false);

  const modesObject = useMemo(() => {
    if (!accessMode) return {};
    return {
      read: accessMode.some((el) => el.includes("Read")),
      write: accessMode.some((el) => el.includes("Write")),
      append: accessMode.some((el) => el.includes("Append")),
      control: accessMode.some((el) => el.includes("Control")),
    };
  }, [accessMode]);
  useEffect(() => {
    if (!requestedResourcesIris || !requestedResourcesIris.length) return;
    setIsChecked(new Array(requestedResourcesIris.length).fill(false));
  }, [requestedResourcesIris]);

  useEffect(() => {
    if (!isChecked) return;
    setAllTogglesSelected(
      isChecked.filter((toggle) => toggle === true).length === isChecked.length
    );
  }, [isChecked]);

  useEffect(() => {
    if (!isChecked) return;
    const accesses = isChecked.map((checked, index) => {
      return {
        checked,
        accessModes: modesObject,
        resourceIri: requestedResourcesIris[index],
        index,
      };
    });
    setSelectedAccess((prevState) => removeExistingValues(prevState, accesses));
  }, [requestedResourcesIris, modesObject, isChecked, setSelectedAccess]);

  const toggleAllSwitches = () => {
    const updatedAllCheckedState = isChecked.map(() => !allTogglesSelected);
    setIsChecked(updatedAllCheckedState);
  };

  const handleOnChange = (position) => {
    const updatedCheckedState = isChecked.map((item, index) =>
      index === position ? !item : item
    );
    setIsChecked(updatedCheckedState);
  };
  if (
    !sectionDetails ||
    !requestedResourcesIris ||
    isChecked === null ||
    isChecked === undefined
  )
    return <Spinner />;

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
              "titleAccessGrant"
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
              {allTogglesSelected ? "Deny all" : "Select all"}
            </Typography>
          </Button>
        </legend>
        <FormGroup
          aria-label="position"
          row
          className={bem("request-container__section", "box")}
        >
          {requestedResourcesIris &&
            requestedResourcesIris.map((resourceIri, index) => {
              return renderSwitch(
                resourceIri,
                index,
                isChecked,
                handleOnChange,
                false,
                setSelectedAccess,
                modesObject
              );
            })}
        </FormGroup>
      </FormControl>
    </>
  );
}

RequestSection.propTypes = {
  agentName: T.string.isRequired,
  setSelectedAccess: T.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  sectionDetails: T.object.isRequired,
};
