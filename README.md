# jocasta-polls-site

The polls app for the Marvel Discord — voting, poll management, and tag
editing for the jocasta polls API. Serves [polls.marvelcord.com](https://polls.marvelcord.com).

## Development

Requirements: Node 22+, pnpm 11.

    pnpm install
    cp .env.example .env.local   # fill in real API URL + guild ID
    pnpm dev

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — eslint
- `pnpm test` — run vitest suite
