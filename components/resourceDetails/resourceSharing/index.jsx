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

/* eslint-disable camelcase, no-console, react/forbid-prop-types */

import { useState, useContext } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import {
  Button,
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { makeStyles } from "@material-ui/styles";
import {
  unstable_hasResourceAcl,
  unstable_hasAccessibleAcl,
  unstable_getResourceAcl,
  unstable_getAgentDefaultAccessOne,
} from "@inrupt/solid-client";
import SessionContext from "../../../src/contexts/sessionContext";
import { resourceContextRedirect } from "../../resourceLink";
import {
  ACL,
  displayPermissions,
  fetchProfile,
  getThirdPartyPermissions,
  getUserPermissions,
  savePermissions,
} from "../../../src/solidClientHelpers";
import styles from "../styles";
import AgentSearchForm from "../../agentSearchForm";
import DefaultPermissionForm from "./defaultPermissionForm";
import AgentAccessList from "./agentAccessList";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export async function handleAddAgentClick(
  agentId,
  addedAgents,
  setAddedAgents,
  fetch
) {
  try {
    const profile = await fetchProfile(agentId, fetch);
    const { webId } = profile;
    const exists = addedAgents.some(({ webId: id }) => id === profile.webId);
    if (!exists) {
      setAddedAgents([
        ...addedAgents,
        {
          webId,
          profile,
          alias: ACL.NONE.alias,
          acl: ACL.NONE.acl,
        },
      ]);
    }
  } catch ({ message }) {
    console.error(message);
  }
}

export function onThirdPartyAccessSubmit({
  addedAgents,
  setAddedAgents,
  setThirdPartyPermissions,
  thirdPartyPermissions,
}) {
  return async (profile, acl) => {
    const alias = displayPermissions(acl);
    const { webId } = profile;

    setAddedAgents(addedAgents.filter((a) => a.webId !== webId));
    setThirdPartyPermissions([
      ...thirdPartyPermissions,
      {
        alias,
        acl,
        webId,
        profile,
      },
    ]);
  };
}

function NoThirdPartyPermissions({ classes }) {
  return (
    <section className={classes.centeredSection}>
      <List>
        <ListItem key={0} className={classes.listItem}>
          <ListItemIcon>
            <PersonIcon />
            People
          </ListItemIcon>
        </ListItem>

        <ListItem key={1} className={classes.listItem}>
          <Typography className={classes.detailText}>
            No 3rd party access
          </Typography>
        </ListItem>
      </List>
    </section>
  );
}

NoThirdPartyPermissions.propTypes = {
  classes: T.object.isRequired,
};

export { NoThirdPartyPermissions };

export function thirdPartySubmitHandler({
  setThirdPartyPermissions,
  thirdPartyPermissions,
}) {
  return (agent, access) => {
    if (Object.values(access).some((x) => x)) return;

    setThirdPartyPermissions(
      thirdPartyPermissions.filter(({ webId }) => webId !== agent.webId)
    );
  };
}

function ThirdPartyPermissions(props) {
  const {
    thirdPartyPermissions,
    classes,
    iri,
    setThirdPartyPermissions,
  } = props;

  if (!thirdPartyPermissions) return null;
  if (thirdPartyPermissions.length === 0) {
    return <NoThirdPartyPermissions classes={classes} />;
  }

  const onSubmit = thirdPartySubmitHandler({
    thirdPartyPermissions,
    setThirdPartyPermissions,
  });

  return (
    <section className={classes.centeredSection}>
      <h5 className={classes["content-h5"]}>Sharing</h5>
      <List>
        <ListItem key={0} className={classes.listItem}>
          <ListItemIcon>
            <PersonIcon />
            People
          </ListItemIcon>
        </ListItem>

        <Divider />

        <AgentAccessList
          permissions={thirdPartyPermissions}
          classes={classes}
          saveFn={savePermissions}
          onSubmit={onSubmit}
          iri={iri}
        />
      </List>
    </section>
  );
}

ThirdPartyPermissions.propTypes = {
  thirdPartyPermissions: T.arrayOf(T.object).isRequired,
  classes: T.object.isRequired,
  iri: T.string.isRequired,
  setThirdPartyPermissions: T.func.isRequired,
};

export { ThirdPartyPermissions };

export function backToDetailsClick(router) {
  return async () => {
    const { iri, resourceIri } = router.query;
    await resourceContextRedirect("details", resourceIri, iri, router);
  };
}

function ResourceSharing({ name, iri, permissions, dataset }) {
  const { session } = useContext(SessionContext);
  const {
    fetch,
    info: { webId },
  } = session;
  const [addedAgents, setAddedAgents] = useState([]);

  const userPermissions = getUserPermissions(webId, permissions);
  const [thirdPartyPermissions, setThirdPartyPermissions] = useState(
    getThirdPartyPermissions(webId, permissions)
  );
  const classes = useStyles();
  const router = useRouter();
  const iriString = iri;
  const defaultPermission = {
    webId,
    alias: "Control",
    profile: { webId },
    acl: {
      read: true,
      write: true,
      append: true,
      control: true,
    },
  };

  if (unstable_hasResourceAcl(dataset) && unstable_hasAccessibleAcl(dataset)) {
    const resourceAcl = unstable_getResourceAcl(dataset);
    const acl = unstable_getAgentDefaultAccessOne(resourceAcl, webId);
    defaultPermission.acl = acl;
  }

  const onThirdPartyPermissionSubmit = onThirdPartyAccessSubmit({
    setAddedAgents,
    addedAgents,
    thirdPartyPermissions,
    setThirdPartyPermissions,
  });

  return (
    <>
      <div className={classes.drawerHeader}>
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={backToDetailsClick(router)}
        >
          Details
        </Button>
      </div>

      <Divider />

      <section className={classes.headerSection}>
        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>My Access</h5>
        <AgentAccessList
          permissions={userPermissions ? [userPermissions] : []}
          iri={iriString}
          saveFn={savePermissions}
          warn
        />
      </section>

      <ThirdPartyPermissions
        iri={iriString}
        thirdPartyPermissions={thirdPartyPermissions}
        setThirdPartyPermissions={setThirdPartyPermissions}
        classes={classes}
      />

      <Divider />

      <section className={classes.centeredSection}>
        <AgentSearchForm
          onSubmit={async (agentId) => {
            await handleAddAgentClick(
              agentId,
              addedAgents,
              setAddedAgents,
              fetch
            );
          }}
        />
      </section>

      <section className={classes.centeredSection}>
        <AgentAccessList
          permissions={addedAgents}
          iri={iriString}
          onSubmit={onThirdPartyPermissionSubmit}
          saveFn={savePermissions}
        />
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <DefaultPermissionForm
          iri={iriString}
          webId={webId}
          permission={defaultPermission}
        />
      </section>
    </>
  );
}

ResourceSharing.propTypes = {
  name: T.string.isRequired,
  iri: T.string.isRequired,
  permissions: T.arrayOf(T.object).isRequired,
  dataset: T.object.isRequired,
};

export default ResourceSharing;
