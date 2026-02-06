import { defineConfig } from 'prisma/config'
import { env as envConfig } from "./src/env"

export default defineConfig({
    schema: './prisma/schema.prisma',
    migrations: {
        path: './prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        url: envConfig.DIRECT_URL,
    },
})
