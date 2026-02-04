-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_routeId_key" ON "Like"("userId", "routeId");

-- CreateIndex
CREATE INDEX "Like_routeId_idx" ON "Like"("routeId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Trip_Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
