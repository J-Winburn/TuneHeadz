-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "profileImage" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTrack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "albumName" TEXT,
    "imageUrl" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedTrack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'succeeded',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "albumName" TEXT,
    "imageUrl" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyId_key" ON "User"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_spotifyId_idx" ON "User"("spotifyId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "SavedTrack_userId_idx" ON "SavedTrack"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedTrack_userId_spotifyTrackId_key" ON "SavedTrack"("userId", "spotifyTrackId");

-- CreateIndex
CREATE INDEX "GeneratedTrack_userId_idx" ON "GeneratedTrack"("userId");

-- CreateIndex
CREATE INDEX "GeneratedTrack_createdAt_idx" ON "GeneratedTrack"("createdAt");

-- CreateIndex
CREATE INDEX "Playlist_userId_idx" ON "Playlist"("userId");

-- CreateIndex
CREATE INDEX "PlaylistTrack_playlistId_idx" ON "PlaylistTrack"("playlistId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_searchedAt_idx" ON "SearchHistory"("searchedAt");

-- AddForeignKey
ALTER TABLE "SavedTrack" ADD CONSTRAINT "SavedTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedTrack" ADD CONSTRAINT "GeneratedTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
