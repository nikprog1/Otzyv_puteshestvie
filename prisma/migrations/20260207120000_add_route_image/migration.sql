-- CreateTable
CREATE TABLE "RouteImage" (
    "id" UUID NOT NULL,
    "routeId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "original" TEXT NOT NULL,
    "url150" TEXT,
    "url300" TEXT,
    "url600" TEXT,
    "url1080" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteImage_routeId_idx" ON "RouteImage"("routeId");

-- AddForeignKey
ALTER TABLE "RouteImage" ADD CONSTRAINT "RouteImage_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Trip_Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
