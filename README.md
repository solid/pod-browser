# pod-manager

An application for browsing the data on your Solid pod, and for setting ACLs on
that data.

# Installation

1. `npm install`
1. `git submodule update --init` to clone private packages as submodules
1. `cd lib/prism && npm i && npm run build` to install and build prism
1. `cd lib/solid-auth-fetcher && npm i && npm run build` to install and build
  solid-auth-fetcher
1. `cd lib/lit-solid-core && npm i && npm run build` to install and build
  lit-solid-core
1. Copy `.env-example` into `.env` and update any variables you need.
1. `npm run dev` to run a dev server, or `npm run build` to compile static html
  and other assets.

# Development

* Pod Manager uses a framework called [Next.js](https://nextjs.org/), which has
  [extensive documentation](https://nextjs.org/docs/getting-started). It uses
  React for client-side templates, Webpack for building assets, Typescript for
  javascript, and Jest for tests.
* Any environment variables you wish to expose must be added to next.config.js.


# Notes

* prism, solid-auth-fetcher, and lit-solid-core are currently a submodule under
  lib/* until they're published as npm modules.
