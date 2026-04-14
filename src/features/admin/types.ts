import type {
  MonitoringAuditRowDto,
  MonitoringUsersListRowDto,
} from "@/modules/admin/types";

export interface AdminPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersViewModel {
  rows: MonitoringUsersListRowDto[];
  pagination: AdminPagination;
}

export interface AdminAuditViewModel {
  rows: MonitoringAuditRowDto[];
  pagination: AdminPagination;
}
