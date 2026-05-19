-- Reconcile schema drift for SystemRole enum.
-- Some environments already have PLATFORM_ADMIN applied manually.
ALTER TYPE "SystemRole" ADD VALUE IF NOT EXISTS 'PLATFORM_ADMIN';
