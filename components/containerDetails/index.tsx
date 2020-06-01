/* eslint-disable @typescript-eslint/no-explicit-any, prettier/prettier */
import { ReactElement } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, List, ListItem, Divider } from "@material-ui/core";
import styles from "./styles";

const useStyles = makeStyles(styles);

interface Props {
  iri: string;
  name?: string | null;
  type?: string | null;
}

export default function ContainerDetails({
  iri,
  name,
  type,
}: Props): ReactElement {
  const classes = useStyles();

  return (
    <>
      <section className={classes.centeredSection}>
        <Typography variant="h3" title={iri}>{name}</Typography>
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
