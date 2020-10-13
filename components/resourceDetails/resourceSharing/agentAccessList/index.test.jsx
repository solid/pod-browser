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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mountToJson } from "../../../../__testUtils/mountWithTheme";
import * as permissionHelpers from "../../../../src/solidClientHelpers/permissions";
import AgentAccessList from ".";
import mockSession from "../../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../../__testUtils/mockSessionContextProvider";

const datasetUrl = "http://example.com/dataset";
const dataset = mockSolidDatasetFrom(datasetUrl);
const { ACL } = permissionHelpers;
const webId = "webId";
const permission = {
  webId,
  alias: ACL.CONTROL.alias,
  acl: ACL.CONTROL.acl,
  profile: { webId },
};

describe("AgentAccessList", () => {
  let session;
  let SessionProvider;

  beforeEach(() => {
    session = mockSession();
    SessionProvider = mockSessionContextProvider(session);
    jest.spyOn(permissionHelpers, "getPermissions").mockResolvedValue([]);
  });

  it("renders an AgentAccessList", () => {
    expect(mountToJson(<AgentAccessList />)).toMatchSnapshot();
  });

  it("renders a about empty list of permissions", () => {
    expect(
      mountToJson(
        <SessionProvider>
          <DatasetProvider dataset={dataset}>
            <AgentAccessList />
          </DatasetProvider>
        </SessionProvider>
      )
    ).toMatchSnapshot();
  });

  it("renders a list of permissions", () => {
    permissionHelpers.getPermissions.mockResolvedValue([permission]);
    expect(
      mountToJson(
        <SessionProvider>
          <DatasetProvider dataset={dataset}>
            <AgentAccessList />
          </DatasetProvider>
        </SessionProvider>
      )
    ).toMatchSnapshot();
  });
});
