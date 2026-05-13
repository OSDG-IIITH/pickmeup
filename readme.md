## pickmeup

idea bank for iiit hyderabad. post ideas, discuss, like, take them up.

### setup

install dependencies
```
bun install
```

set environment variables
```
cp .env.example .env
```

start the database
```
bun run db:start
```

push schema and seed data
```
bun run db:push
bun run db:seed
```

run
```
bun run dev
```

will be running at `localhost:5173` :)
