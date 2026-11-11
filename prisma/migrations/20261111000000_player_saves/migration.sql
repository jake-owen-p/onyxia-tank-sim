-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "settings" JSONB,
    "keybinds" JSONB,
    "tutorials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "playerId" UUID NOT NULL,
    "id" UUID NOT NULL,
    "modeKey" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("playerId","id")
);

-- CreateTable
CREATE TABLE "BestScore" (
    "playerId" UUID NOT NULL,
    "modeKey" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BestScore_pkey" PRIMARY KEY ("playerId","modeKey")
);

-- CreateIndex
CREATE INDEX "Run_playerId_playedAt_idx" ON "Run"("playerId", "playedAt" DESC);

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestScore" ADD CONSTRAINT "BestScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase owns auth.users. Account deletion also removes game saves.
ALTER TABLE "Player" ADD CONSTRAINT "Player_auth_user_fkey" FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE;
-- Only the authenticated server API accesses these tables. The browser's
-- Supabase key has no direct table access, even for signed-in clients.
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Run" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BestScore" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "Player", "Run", "BestScore" FROM anon, authenticated;
