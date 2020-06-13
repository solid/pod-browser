/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import {
  Typography,
  List,
  ListItem,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { unstable_AgentAccess } from "lit-solid";
import UserContext from "../../src/contexts/UserContext";
import { normalizePermissions } from "../../src/lit-solid-helpers";

function getUserAccess(permissions, id: string) {
  return permissions.find(({ webId }) => webId === id);
}

function getThirdPartyAccess(permissions, id: string) {
  return permissions.filter(({ webId }) => webId !== id);
}

function displayThirdPartyAccess(thirdPartyAccess, classes) {
  return thirdPartyAccess.map(({ webId, access }) => {
    return (
      <ListItem className={classes.listItem}>
        <Typography className={classes.detailText}>{webId}</Typography>
        <Typography className={`${classes.typeValue} ${classes.detailText}`}>
          {access}
        </Typography>
      </ListItem>
    );
  });
}

export interface Props {
  iri: string;
  name?: string;
  acl?: unstable_AgentAccess;
  classes: Record<string, unknown>;
}

export default function ResourceDetails({
  iri,
  name,
  acl,
  classes,
}: Props): ReactElement {
  const { session } = useContext(UserContext);
  const { webId } = session;
  const normalizedPerms = normalizePermissions(acl);
  const personalAccess = getUserAccess(normalizedPerms, webId);
  const thirdPartyAccess = getThirdPartyAccess(normalizedPerms, webId);

  return (
    <>
      <section className={classes.centeredSection}>
        <Typography variant="h3" title={iri}>
          {name}
        </Typography>
      </section>

      <Divider />

      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">My Access</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            <ListItem className={classes.listItem}>
              <Typography className={classes.detailText}>My Access</Typography>
              <Typography
                className={`${classes.typeValue} ${classes.detailText}`}
              >
                {personalAccess.access}
              </Typography>
            </ListItem>
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Sharing</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography variant="h6">People</Typography>
          <List>{displayThirdPartyAccess(thirdPartyAccess, classes)}</List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </>
  );
}
