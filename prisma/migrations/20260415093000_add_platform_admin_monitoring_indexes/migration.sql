-- CreateIndex
CREATE INDEX "Movement_createdAt_idx" ON "Movement"("createdAt");

-- CreateIndex
CREATE INDEX "Movement_type_createdAt_idx" ON "Movement"("type", "createdAt");

-- CreateIndex
CREATE INDEX "User_systemRole_idx" ON "User"("systemRole");

-- CreateIndex
CREATE INDEX "Membership_orgId_role_createdAt_idx" ON "Membership"("orgId", "role", "createdAt");
