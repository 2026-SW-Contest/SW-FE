import { apiGet, apiRequest, toQueryString } from "./client";

export type AdminFacilityStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";
type AdminFacilityUiStatus = "waiting" | "inProgress" | "resolved";

interface AdminFacilityListItem {
  id: number;
  title: string;
  requesterId: number;
  requesterName: string;
  studentNumber: string;
  category: string;
  categoryId: number;
  location: string;
  locationId: number;
  submittedAt: string;
  createdAt: string;
  description: string;
  status: AdminFacilityUiStatus;
  statusName: string;
  thumbnailUrl: string | null;
}

interface AdminFacilityRequesterResponse {
  userId: number;
  name: string;
  studentNumber: string | null;
  email?: string;
}

interface AdminFacilityCategoryResponse {
  categoryId: number;
  categoryName: string;
}

interface AdminFacilityLocationResponse {
  locationId: number;
  locationCode: string | null;
  locationName: string;
}

interface AdminFacilitySummaryResponse {
  facilityRequestId: number;
  title: string;
  requester: AdminFacilityRequesterResponse;
  category: AdminFacilityCategoryResponse;
  location: AdminFacilityLocationResponse;
  requestStatus: AdminFacilityStatus;
  requestStatusName: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface AdminFacilityPageResponse {
  content: AdminFacilitySummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface AdminFacilityAttachmentResponse {
  fileId: number;
  originalFilename: string;
  fileUrl: string;
}

interface AdminFacilityResponseItem {
  responseId: number;
  content: string;
  createdAt: string;
}

interface AdminFacilityDetailResponse {
  facilityRequestId: number;
  title: string;
  description: string;
  requester: AdminFacilityRequesterResponse;
  category: AdminFacilityCategoryResponse;
  location: AdminFacilityLocationResponse;
  requestStatus: AdminFacilityStatus;
  requestStatusName: string;
  attachments: AdminFacilityAttachmentResponse[];
  adminResponses: AdminFacilityResponseItem[];
  createdAt: string;
  updatedAt: string;
}

interface UpdateAdminFacilityResponse {
  facilityRequestId: number;
  previousStatus: AdminFacilityStatus;
  requestStatus: AdminFacilityStatus;
  requestStatusName: string;
  adminResponse: AdminFacilityResponseItem | null;
  updatedAt: string;
}

export interface UpdateAdminFacilityRequest {
  status?: AdminFacilityStatus;
  adminResponse?: string;
}

export interface AdminFacilityQuery {
  keyword?: string;
  status?: AdminFacilityStatus;
  categoryId?: number;
  locationId?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface AdminFacilityPage {
  content: AdminFacilityListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

const normalizeAdminStatus = (
  status: AdminFacilityStatus,
): AdminFacilityUiStatus => {
  if (status === "IN_PROGRESS") return "inProgress";
  if (status === "COMPLETED") return "resolved";
  return "waiting";
};

const formatAdminDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace(/-/g, ".");

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
};

export const toAdminFacilityStatus = (
  status: AdminFacilityUiStatus | "all",
): AdminFacilityStatus | undefined => {
  if (status === "waiting") return "WAITING";
  if (status === "inProgress") return "IN_PROGRESS";
  if (status === "resolved") return "COMPLETED";
  return undefined;
};

export const getAdminFacilityRequests = async (
  query: AdminFacilityQuery = {},
): Promise<AdminFacilityPage> => {
  const response = await apiGet<AdminFacilityPageResponse>(
    `/api/admin/facility-requests${toQueryString({
      keyword: query.keyword,
      status: query.status,
      categoryId: query.categoryId,
      locationId: query.locationId,
      from: query.from,
      to: query.to,
      page: query.page,
      size: query.size,
    })}`,
  );

  return {
    ...response,
    content: response.content.map((item) => ({
      id: item.facilityRequestId,
      title: item.title,
      requesterId: item.requester.userId,
      requesterName: item.requester.name,
      studentNumber: item.requester.studentNumber ?? "-",
      category: item.category.categoryName,
      categoryId: item.category.categoryId,
      location: [item.location.locationCode, item.location.locationName]
        .filter(Boolean)
        .join(" "),
      locationId: item.location.locationId,
      submittedAt: formatAdminDate(item.createdAt),
      createdAt: item.createdAt,
      description: "",
      status: normalizeAdminStatus(item.requestStatus),
      statusName: item.requestStatusName,
      thumbnailUrl: item.thumbnailUrl,
    })),
  };
};

export const getAdminFacilityRequest = async (facilityRequestId: number) => {
  const item = await apiGet<AdminFacilityDetailResponse>(
    `/api/admin/facility-requests/${facilityRequestId}`,
  );

  return {
    id: item.facilityRequestId,
    title: item.title,
    requesterId: item.requester.userId,
    requesterName: item.requester.name,
    studentNumber: item.requester.studentNumber ?? "-",
    requesterEmail: item.requester.email ?? "",
    category: item.category.categoryName,
    categoryId: item.category.categoryId,
    location: [item.location.locationCode, item.location.locationName]
      .filter(Boolean)
      .join(" "),
    locationId: item.location.locationId,
    submittedAt: formatAdminDate(item.createdAt),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    description: item.description,
    status: normalizeAdminStatus(item.requestStatus),
    statusName: item.requestStatusName,
    imageUrls: item.attachments.map((attachment) => attachment.fileUrl),
    attachments: item.attachments,
    adminResponses: item.adminResponses,
  };
};

export const updateAdminFacilityRequest = (
  facilityRequestId: number,
  request: UpdateAdminFacilityRequest,
) =>
  apiRequest<UpdateAdminFacilityResponse>(
    `/api/admin/facility-requests/${facilityRequestId}`,
    {
      method: "PATCH",
      body: request,
    },
  );
