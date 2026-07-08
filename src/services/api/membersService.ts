import axiosInstance from "@/services/api/axiosInstance";
import type {
  CreateMemberDto,
  GetMembersParams,
  Member,
  PaginatedMembersResponse,
  UpdateMemberDto
} from "@/types/member";

export const membersService = {
  async getMembers(
    params: GetMembersParams,
    signal?: AbortSignal
  ): Promise<PaginatedMembersResponse> {
    const response = await axiosInstance.get<PaginatedMembersResponse>("/members", {
      params,
      signal
    });
    return response.data;
  },

  async getMemberById(id: string): Promise<Member> {
    const response = await axiosInstance.get<Member>(`/members/${id}`);
    return response.data;
  },

  async createMember(data: CreateMemberDto): Promise<Member> {
    const response = await axiosInstance.post<Member>("/members", data);
    return response.data;
  },

  async updateMember(id: string, data: UpdateMemberDto): Promise<Member> {
    const response = await axiosInstance.put<Member>(`/members/${id}`, data);
    return response.data;
  },

  async deleteMember(id: string): Promise<void> {
    await axiosInstance.delete(`/members/${id}`);
  }
};
