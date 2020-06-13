import { ReactElement } from "react";
import { Typography, List, ListItem, Divider } from "@material-ui/core";

export interface Props {
  iri: string;
  name?: string;
  type?: string;
  classes: Record<string, unknown>;
}

export default function ContainerDetails({
  iri,
  name,
  type,
  classes,
}: Props): ReactElement {
  return (
    <>
      <section className={classes.centeredSection}>
        <Typography variant="h3" title={iri}>
          {name}
        </Typography>
      </section>

      <section className={classes.centeredSection}>
        <Typography variant="h5">Details</Typography>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>Thing Type:</Typography>
            <Typography
              className={`${classes.typeValue} ${classes.detailText}`}
            >
              {type}
            </Typography>
          </ListItem>
        </List>
      </section>
    </>
  );
}
