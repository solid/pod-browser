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
import { rdf, vcard } from "rdf-namespaces";
import * as scFns from "@inrupt/solid-client";
import { CombinedDataProvider, ThingProvider } from "@inrupt/solid-ui-react";
import { addUrl, getUrl, setThing } from "@inrupt/solid-client";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import ContactInfoTable, {
  CONTACT_INFO_TYPE_EMAIL,
  DEFAULT_CONTACT_TYPE,
  PREFIX_MAP,
  setupAddContactDetail,
  setupColumnTypeBody,
  setupColumnValueBody,
  setupDeleteButtonCell,
  setupOnChange,
  setupOnSave,
  setupRemoveRow,
  setupRowProps,
  setupSaveHandler,
} from "./index";
import useDataset from "../../../src/hooks/useDataset";
import {
  aliceWebIdUrl,
  mockPersonDatasetAliceWithContactInfo,
  mockPersonThingAliceWithContactInfo,
} from "../../../__testUtils/mockPersonResource";

jest.mock("../../../src/hooks/useDataset");
const mockedUseDataset = useDataset;

const { mockSolidDatasetFrom, mockThingFrom } = scFns;
const dataset = mockPersonDatasetAliceWithContactInfo();
const profile = mockThingFrom("http://example.com/profile#this");

beforeEach(() => {
  mockedUseDataset.mockReturnValue(dataset);
});

describe("ContactInfoTable", () => {
  it("renders a table of contact info", async () => {
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const contactInfo = [
      {
        type: vcard.Home,
        value: "tel:42-1337",
      },
      { type: vcard.Home, value: "mailto:alice@example.com" },
    ];

    const { asFragment, findByRole } = renderWithTheme(
      <SessionProvider>
        <ContactInfoTable
          property={vcard.hasEmail}
          contactInfoType={CONTACT_INFO_TYPE_EMAIL}
          values={contactInfo}
          webId={aliceWebIdUrl}
        />
      </SessionProvider>
    );
    await expect(findByRole("table")).resolves.not.toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an editable table of contact info", () => {
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const profileDataset = mockPersonDatasetAliceWithContactInfo();
    const thing = mockPersonThingAliceWithContactInfo();

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <CombinedDataProvider solidDataset={profileDataset} thing={thing}>
          <ContactInfoTable
            property={vcard.hasEmail}
            editing
            contactInfoType={CONTACT_INFO_TYPE_EMAIL}
            webId={aliceWebIdUrl}
          />
        </CombinedDataProvider>
      </SessionProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupAddContactDetail", () => {
  it("handles adding telephone numbers", async () => {
    const property = vcard.hasTelephone;
    const contactType = DEFAULT_CONTACT_TYPE;
    const contactValue = "42-1337";
    const saveHandler = jest.fn();
    const setNewContactValue = jest.fn();

    await expect(
      setupAddContactDetail(
        property,
        contactType,
        contactValue,
        dataset,
        profile,
        saveHandler,
        setNewContactValue
      )()
    ).resolves.toBeUndefined();

    expect(saveHandler).toHaveBeenCalled();
    const newDataset = saveHandler.mock.calls[0][1];
    const newContactDetail = scFns.getThing(
      newDataset,
      "http://alice.example.com/phone"
    );
    expect(getUrl(newContactDetail, rdf.type)).toEqual(contactType);
    expect(getUrl(newContactDetail, vcard.value)).toEqual(
      `${PREFIX_MAP[property]}${contactValue}`
    );

    expect(setNewContactValue).toHaveBeenCalledWith("");
  });
});

describe("setupSaveHandler", () => {
  it("sets a save handler using saveSolidDatasetAt", async () => {
    const savedDataset = "savedDataset";
    jest.spyOn(scFns, "saveSolidDatasetAt").mockResolvedValue(savedDataset);
    const fetch = jest.fn();
    const setDataset = jest.fn();
    const newThing = mockThingFrom("http://example.com/#newThing");
    const datasetUrl = "http://example.com";
    const datasetToUpdate = mockSolidDatasetFrom(datasetUrl);

    await expect(
      setupSaveHandler(fetch, setDataset)(newThing, datasetToUpdate)
    ).resolves.toBeUndefined();
    expect(scFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      datasetUrl,
      setThing(datasetToUpdate, newThing),
      { fetch }
    );
    expect(setDataset).toHaveBeenCalledWith(savedDataset);
  });
});

describe("setupRemoveRow", () => {
  it("removes details and saves change", async () => {
    const property = vcard.hasTelephone;
    const contactValue = "tel:test";
    const profileWithNumber = addUrl(profile, property, contactValue);
    const saveHandler = jest.fn();
    await expect(
      setupRemoveRow(
        profileWithNumber,
        property,
        saveHandler,
        dataset
      )(mockThingFrom(contactValue))
    ).resolves.toBeUndefined();
    expect(saveHandler).toHaveBeenCalled();
    const [newProfile] = saveHandler.mock.calls[0];
    expect(getUrl(newProfile, property)).toBeNull();
  });
});

describe("setupDeleteButtonCell", () => {
  const thing = mockThingFrom("http://example.com#thing");

  it("returns a button if editable", () => {
    const removeRow = jest.fn();
    const contactInfoType = CONTACT_INFO_TYPE_EMAIL;
    const Button = setupDeleteButtonCell(true, contactInfoType, removeRow);

    const { asFragment, container } = render(
      <ThingProvider thing={thing}>
        <Button />
      </ThingProvider>
    );

    expect(asFragment()).toMatchSnapshot();

    userEvent.click(container.querySelector("button"));
    expect(removeRow).toHaveBeenCalledWith(thing);
  });

  it("renders nothing if not editable", () => {
    const contactInfoType = CONTACT_INFO_TYPE_EMAIL;
    const Component = setupDeleteButtonCell(
      false,
      contactInfoType,
      () => {},
      () => {}
    );

    const { asFragment } = render(
      <ThingProvider thing={thing}>
        <Component />
      </ThingProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupRowProps", () => {
  it("sets up row props", () => {
    const bem = (value) => value;
    expect(setupRowProps(bem)()).toEqual({
      className: "table__body-row",
    });
  });
});

describe("setupColumnTypeBody", () => {
  it("sets up body for type", () => {
    const columnTypeBody = setupColumnTypeBody(CONTACT_INFO_TYPE_EMAIL);
    const { asFragment } = render(columnTypeBody({ value: vcard.Home }));
    expect(asFragment()).toMatchSnapshot();
  });

  it("has a fallback if value is not valid", () => {
    const columnTypeBody = setupColumnTypeBody(CONTACT_INFO_TYPE_EMAIL);
    const { asFragment } = render(columnTypeBody({ value: "invalid" }));
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupOnSave", () => {
  it("sets dataset", () => {
    const setDataset = jest.fn();
    expect(setupOnSave(setDataset)(dataset)).toBeUndefined();
    expect(setDataset).toHaveBeenCalledWith(dataset);
  });
});

describe("setupColumnValueBody", () => {
  const bem = (value) => value;
  const onSave = () => {};

  it("renders for read-only mode", () => {
    const { asFragment } = render(setupColumnValueBody(false, bem, onSave)());
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders for editing mode", () => {
    const { asFragment } = render(setupColumnValueBody(true, bem, onSave)());
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupOnChange", () => {
  it("setups an onChange handler", () => {
    const setValue = jest.fn();
    const onChange = setupOnChange(setValue);
    const value = "value";
    expect(onChange({ target: { value } })).toBeUndefined();
    expect(setValue).toHaveBeenCalledWith(value);
  });
});
