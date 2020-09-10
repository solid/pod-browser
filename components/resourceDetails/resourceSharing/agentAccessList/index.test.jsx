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
import { mountToJson } from "../../../../__testUtils/mountWithTheme";
import * as PermissionHelpers from "../../../../src/solidClientHelpers/permissions";
import AgentAccessList, { handleSave } from ".";

describe("AgentAccessList", () => {
  test("it renders an AgentAccessList", () => {
    const { ACL } = PermissionHelpers;
    const iri = "iri";
    const webId = "webId";
    const onSave = jest.fn();
    const onSubmit = jest.fn();
    const saveFn = jest.fn();
    const permissions = [
      {
        webId,
        alias: ACL.CONTROL.alias,
        acl: ACL.CONTROL.acl,
        profile: { webId },
      },
    ];
    const tree = mountToJson(
      <AgentAccessList
        iri={iri}
        onSave={onSave}
        onSubmit={onSubmit}
        permissions={permissions}
        saveFn={saveFn}
        warn
      />
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("handleSave", () => {
  test("it returns a handler that calls the saveFn and callbacks", async () => {
    const { ACL } = PermissionHelpers;
    const iri = "iri";
    const webId = "webId";
    const onSave = jest.fn();
    const onSubmit = jest.fn();
    const fetch = jest.fn();
    const saveFn = jest.fn(() => "response");
    const profile = { webId };
    const access = ACL.CONTROL.acl;
    const handler = handleSave({
      fetch,
      iri,
      onSave,
      onSubmit,
      profile,
      saveFn,
      webId,
    });

    await handler(access);

    expect(onSubmit).toHaveBeenCalledWith(profile, access);
    expect(saveFn).toHaveBeenCalledWith({ iri, webId, access, fetch });
    expect(onSave).toHaveBeenCalledWith(profile, "response");
  });
});
