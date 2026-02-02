-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_routeId_key" ON "Favorite"("userId", "routeId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_routeId_idx" ON "Favorite"("routeId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Trip_Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
