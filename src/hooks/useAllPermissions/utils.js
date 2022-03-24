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
import { getPolicyDetailFromAccess } from "../../accessControl/acp";

export const findSharingTypeForAgents = (agents) => {
  const outputArray = [];
  Object.keys(agents).forEach((key) => {
    const tempObj = {};
    tempObj.webId = key;
    tempObj.permissions = agents[key];
    const access = {
      read: tempObj.permissions.read,
      append: tempObj.permissions.append,
      write: tempObj.permissions.write,
    };
    const alias = getPolicyDetailFromAccess(access, "name");
    tempObj.alias = alias;
    outputArray.push(tempObj);
  });
  return outputArray;
};

// where we make an array of everyone with the same type (ex: viewer) of permission
// [{type:'editors',data:[webId,webID,webId]}, {type:'viewers',data:[webId,webID,webId]}]
export const mapAgentsToSharingType = (agents) => {
  const sharingTypeHash = {};
  const output = [];
  agents.forEach((agent) => {
    const { alias } = agent;
    if (sharingTypeHash[alias]) {
      sharingTypeHash[alias].push(agent);
    } else {
      sharingTypeHash[alias] = [agent];
    }
  });
  Object.keys(sharingTypeHash).forEach((key) => {
    output.push({ type: key, data: sharingTypeHash[key] });
  });

  return output;
};
