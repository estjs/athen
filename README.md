# Talk: Package-based Monorepos - Speed Up in Under 7 Minutes

This is the demo repo for the talk I gave at [JSNation 2023](https://jsnation.com/) in Amsterdam. It contains a PNPM workspaces based monorepo setup with 2 packages that depend on each other as well as a Remix and Next.js app that consume them.

- Talk recording: https://youtu.be/wrJMhl3T2-8?si=xGkMSFBwCJV3OBNs
- Separate video recording: https://youtu.be/PwfR77oe1E8

## Running it locally

Just clone the repo and install the deps with `pnpm i`.

## Explore

Note, Nx is present in this repo via a single `nx` NPM package and an `nx.json` where we define the [cacheable operations](https://nx.dev/core-features/cache-task-results) and [task dependencies (aka task build pipeline)](https://nx.dev/concepts/task-pipeline-configuration).

Run

```sh
pnpm dlx nx graph
```

..to get a live visualization of the repo's project graph.

## Running tasks

Run a task (e.g. the build) for a single project. For example:

```sh
pnpm dlx nx build @awesomecards/products
```

Note how it automatically builds also the `ui` package, since `@awesomecards/products` depends on it.

To run **multiple** tasks, use the following command:

```sh
pnpm dlx nx run-many -t build test lint
```

This runs all 3 tasks for all the projects (that have them defined) in parallel (while still respecting the order).

## What else

Here's a couple of potentially interesting links:

- Related blog post: [Setup a Monorepo with PNPM workspaces and speed it up with Nx!](https://dev.to/nx/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx-1eem) (also includes walkthrough video)
- Nx: https://nx.dev/ (GitHub: https://github.com/nrwl/nx)
- Tutorial: Package-based monorepos with Nx: https://nx.dev/tutorials/package-based-repo-tutorial
