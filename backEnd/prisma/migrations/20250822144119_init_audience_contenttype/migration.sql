/*
  Warnings:

  - Added the required column `audience` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Survey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "groups" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audience" TEXT NOT NULL,
    "contentType" TEXT
);
INSERT INTO "new_Survey" ("closedAt", "createdAt", "groups", "id", "title") SELECT "closedAt", "createdAt", "groups", "id", "title" FROM "Survey";
DROP TABLE "Survey";
ALTER TABLE "new_Survey" RENAME TO "Survey";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
