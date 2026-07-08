export interface Member {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  membershipNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMembersResponse {
  data: Member[];
  meta: PaginatedMeta;
}

export interface GetMembersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CreateMemberDto {
  fullName: string;
  email?: string;
  phone?: string;
  membershipNumber?: string;
}

export interface UpdateMemberDto {
  fullName?: string;
  email?: string;
  phone?: string;
  membershipNumber?: string;
  isActive?: boolean;
}
