# CLI Reference

Athen comes with a command line interface (CLI) for developing, building, and previewing your documentation sites.

## Commands

In a project where `athen` is installed, you can run the following commands:

### `athen dev [root]`

Starts the development server.

- **`root`**: Optional. Specifies the root directory of your site (e.g. `docs`). Defaults to the current working directory `.`.
- **`--port <port>`**: Optional. Sets the dev server port. Defaults to `8730`.
- **`--host [host]`**: Optional. Exposes the dev server on the provided host.
- **Details**: This spins up a local dev server with Hot Module Replacement (HMR).

### `athen build [root]`

Builds the static files for production.

- **`root`**: Optional. Specifies the root directory of your site. Defaults to the current working directory `.`.
- **Details**: Performs Static Site Generation (SSG) and outputs the final files to the `dist` directory.

### `athen preview [root]`

Previews the production build locally.

- **`root`**: Optional. Specifies the root directory of your site. Defaults to the current working directory `.`.
- **`--port <port>`**: Optional. Sets the preview server port.
- **`--host [host]`**: Optional. Exposes the preview server on the provided host.
- **Details**: You must run `athen build` before running this command to preview the output locally.
