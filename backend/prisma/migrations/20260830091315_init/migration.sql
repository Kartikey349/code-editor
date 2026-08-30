-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Success', 'Failed', 'Processing');

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "output" TEXT,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);
