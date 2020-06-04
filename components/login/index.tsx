import React, { ReactElement } from "react";
import Link from "next/link";
import { Container, Box, Typography } from "@material-ui/core";

import ProviderLogin from "./provider";

export default function Login(): ReactElement {
  return (
    <Container maxWidth="sm">
      <Typography align="center" component="div">
        <h1>Hi! Welcome to Solid.</h1>

        <Box my={4}>
          <Link href="/register">
            <a>Register for a Solid Identity</a>
          </Link>

          <p>
            <a href="https://solid.inrupt.com/get-a-solid-pod" rel="nofollow">
              What is a Solid Identity?
            </a>
          </p>

          <Typography variant="h5">Log In</Typography>

          <ProviderLogin />
        </Box>
      </Typography>
    </Container>
  );
}
