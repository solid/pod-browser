import React from 'react';
import { CircularProgress, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  'MuiCicularProgress-root': {
    display: 'block',
    position: 'fixed',
    top: '50%',
    right: '50%',
  },
}));

export default function Spinner() {
  const classes = useStyles();
  return (
    <Container>
      <CircularProgress
        className={classes['MuiCicularProgress-root']}
        color="primary"
      />
    </Container>
  );
}
