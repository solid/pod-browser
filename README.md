<span align="center">

# PodBrowser

## A modular tool to view, manage, and control access to your Pod.

[Code of Conduct](code-of-conduct.md) · [Documentation] · [Support]

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

</span>

This project adheres to the Contributor Covenant [code of conduct](code_of_conduct.md). By participating, you are expected to uphold this code.

# Installation

1. `npm install`
2. `npm run dev` to run a dev server, or `npm run build` to compile static HTML and other assets.

# Development

- PodBrowser uses a framework called [Next.js](https://nextjs.org/), which has [extensive documentation](https://nextjs.org/docs/getting-started). It uses [React](https://reactjs.org/) for client-side templates, [Webpack](https://webpack.js.org/) for building assets, and [Jest](https://jestjs.io/) for tests.
- Any environment variables you wish to expose must be added to `next.config.js`.
- When making commits, follow the guidelines outlined in this post: https://cbea.ms/git-commit/

# Deployment

You can use `npm run deploy` to deploy a PodBrowser instance to Vercel, if you create an account. Alternatively, you can:

- Run `npm run build` and `npm run start` to run the node server;
- Run `npm run build` and `npm run export` to export static HTML and assets to host on the server of your choice.
