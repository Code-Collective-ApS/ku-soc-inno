# Soc-inno

A web application that works as a simple collaboration, sharing and archiving platform for sociological cases.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more about the framework.

Feel free to reach out to the [developers](https://codecollective.dk) or the lecturer, [Ghita](https://www.soc.ku.dk/ansatte/professorer/?pure=da/persons/300156), who has designed the app and led the development.

## Setup development environment

1. Install node/npm & yarn

2. Add and edit `.env` file

```bash
cp .env.example .env
```

3. Install dependencies:

```bash
yarn install
```

4. Create database and run migrations

```bash
createdb name_of_db
yarn db:migrate
```

It is expected to receive a couple of warnings if db is already migrated.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
