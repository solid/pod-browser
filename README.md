# pod-manager

An application for browsing the data on your Solid pod, and for setting ACLs on
that data.

# Installation

1. `npm install`
1. Copy `.env-example` into `.env.local` and update any variables you need.
1. `npm run dev` to run a dev server, or `npm run build` to compile static html
  and other assets.

# Development

* Pod Manager uses a framework called [Next.js](https://nextjs.org/), which has
  [extensive documentation](https://nextjs.org/docs/getting-started). It uses
  React for client-side templates, Webpack for building assets, Typescript for
  javascript, and Jest for tests.
* Any environment variables you wish to expose must be added to next.config.js.


# Notes

* prism is temporarily a submodule under lib/* until it's published as an npm module.
