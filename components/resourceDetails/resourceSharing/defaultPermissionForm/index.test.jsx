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
import * as ProfileHelpers from "../../../../src/solidClientHelpers/profile";
import DefaultPermissionForm, { handleAgentAdd, handleAgentSubmit } from ".";

describe("DefaultPermissionForm", () => {
  test("it renders a DefaultPermissionForm", () => {
    const iri = "iri";
    const tree = mountToJson(<DefaultPermissionForm iri={iri} />);

    expect(tree).toMatchSnapshot();
  });
});

describe("handleAgentAdd", () => {
  test("it returns a handler to fetch an agent and add them to the list", async () => {
    const { ACL } = PermissionHelpers;
    const fetch = jest.fn();
    const webId = "webId";
    const profile = { webId };
    const permission = {
      webId,
      profile,
      alias: ACL.NONE.alias,
      acl: ACL.NONE.acl,
    };
    const addedAgents = [];
    const setAddedAgents = jest.fn();
    const onAgentAdd = handleAgentAdd({ addedAgents, setAddedAgents, fetch });

    jest.spyOn(ProfileHelpers, "fetchProfile").mockResolvedValueOnce(profile);

    await onAgentAdd("agentId");

    expect(setAddedAgents).toHaveBeenCalledWith([permission]);
  });

  test("it does not add an agent that is already in the list", async () => {
    const { ACL } = PermissionHelpers;
    const fetch = jest.fn();
    const webId = "webId";
    const profile = { webId };
    const permission = {
      webId,
      profile,
      alias: ACL.NONE.alias,
      acl: ACL.NONE.acl,
    };
    const addedAgents = [permission];
    const setAddedAgents = jest.fn();
    const onAgentAdd = handleAgentAdd({ addedAgents, setAddedAgents, fetch });

    jest.spyOn(ProfileHelpers, "fetchProfile").mockResolvedValueOnce(profile);

    await onAgentAdd("agentId");

    expect(addedAgents).toHaveLength(1);
  });
});

describe("handleAgentSubmit", () => {
  test("it creates a handler that removes the agent from the list", async () => {
    const setAddedAgents = jest.fn();
    const onSubmit = jest.fn();
    const webId = "webId";
    const { acl, alias } = PermissionHelpers.ACL.CONTROL;
    const agent = {
      webId,
      alias,
      acl,
      profile: { webId },
    };
    const addedAgents = [agent];
    const onAgentSubmit = handleAgentSubmit({
      addedAgents,
      setAddedAgents,
      onSubmit,
    });
    await onAgentSubmit(agent, acl);

    expect(setAddedAgents).toHaveBeenCalledWith([]);
    expect(onSubmit).toHaveBeenCalledWith(agent, acl);
  });
});
