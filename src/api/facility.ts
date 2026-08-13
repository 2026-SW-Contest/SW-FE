import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../assets/icons/status/resolved.svg";
import waitingStatusIcon from "../assets/icons/status/waiting.svg";
import {
  FacilityAdminResponse,
  FacilityItem,
  FacilityStatus,
} from "../types/facility";
import { apiGet, apiRequest, toQueryString } from "./client";
import { getPublicFileUrl } from "./file";

interface CursorResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface FacilityRequestResponse {
  facilityRequestId?: number;
  id?: number;
  title: string;
  content?: string;
  description?: string;
  detailDescription?: string;
  status?: string;
  requestStatus?: string;
  requestStatusName?: string;
  categoryName?: string;
  categoryNames?: string[];
  category?: { categoryId?: number; categoryName?: string };
  locationName?: string;
  locationNames?: string[];
  location?: {
    locationId?: number;
    locationCode?: string | null;
    locationName?: string;
  };
  thumbnailUrl?: string | null;
  attachments?: Array<
    | string
    | {
        fileId?: number;
        attachmentUrl?: string;
        fileUrl?: string;
        imageUrl?: string;
        url?: string;
      }
  >;
  imageUrls?: string[];
  images?: string[];
  editable?: boolean;
  deletable?: boolean;
  ownedByCurrentUser?: boolean;
  adminResponses?: FacilityAdminResponse[];
  createdAt?: string;
  createdDate?: string;
}

export interface CreateFacilityRequest {
  title: string;
  description: string;
  categoryId: number;
  locationId: number;
  images: File[];
}

const normalizeStatus = (status?: string): FacilityStatus => {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
    case "PROCESSING":
      return "inProgress";
    case "RESOLVED":
    case "COMPLETED":
      return "resolved";
    case "RECEIVED":
    case "WAITING":
    case "PENDING":
      return "waiting";
    default:
      return "waiting";
  }
};

const statusIcon = (status: FacilityStatus) => {
  if (status === "inProgress") return inProgressStatusIcon;
  if (status === "resolved") return resolvedStatusIcon;
  return waitingStatusIcon;
};

const formatDate = (value?: string) => {
  if (!value) return "";
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

export const mapFacilityItem = (item: FacilityRequestResponse): FacilityItem => {
  const status = normalizeStatus(item.requestStatus ?? item.status);
  const attachmentUrls = item.attachments
    ?.map((attachment) => {
      if (typeof attachment === "string") return attachment;
      return (
        attachment.attachmentUrl ??
        attachment.fileUrl ??
        attachment.imageUrl ??
        attachment.url ??
        (attachment.fileId ? getPublicFileUrl(attachment.fileId) : undefined)
      );
    })
    .filter((url): url is string => Boolean(url));
  const images =
    attachmentUrls?.length
      ? attachmentUrls
      : item.imageUrls ??
        item.images ??
        (item.thumbnailUrl ? [item.thumbnailUrl] : undefined);
  const type =
    item.categoryNames?.join(", ") ||
    item.categoryName ||
    item.category?.categoryName ||
    "기타";
  const location =
    item.locationNames?.join(", ") ||
    item.locationName ||
    [item.location?.locationCode, item.location?.locationName]
      .filter(Boolean)
      .join(" ");
  const description =
    item.content ?? item.description ?? item.detailDescription ?? "";

  return {
    id: item.facilityRequestId ?? item.id ?? 0,
    image: images?.[0] ?? emptyImage,
    images,
    title: item.title,
    description,
    detailDescription: description,
    date: formatDate(item.createdAt ?? item.createdDate),
    type,
    categoryId: item.category?.categoryId,
    location,
    locationId: item.location?.locationId,
    status,
    statusIcon: statusIcon(status),
    adminResponses: item.adminResponses ?? [],
    ownedByCurrentUser: item.ownedByCurrentUser === true,
    editable: item.editable === true,
    deletable: item.deletable === true,
  };
};

export const getFacilityRequests = async (cursor?: string, size = 50) => {
  const response = await apiGet<CursorResponse<FacilityRequestResponse>>(
    `/api/facility-requests${toQueryString({ cursor, size })}`,
  );

  // 목록 응답에는 description이 포함되지 않으므로 카드 본문을 표시하려면
  // 각 항목의 상세 응답을 합쳐야 한다. 상세 조회 실패 항목은 목록 정보로 유지한다.
  const content = await Promise.all(
    response.content.map(async (summary) => {
      const id = summary.facilityRequestId ?? summary.id;
      if (!id) return mapFacilityItem(summary);

      try {
        const detail = await apiGet<FacilityRequestResponse>(
          `/api/facility-requests/${id}`,
        );
        return mapFacilityItem({ ...summary, ...detail });
      } catch {
        return mapFacilityItem(summary);
      }
    }),
  );

  return {
    ...response,
    content,
  };
};

export const getMyFacilityRequests = async (
  cursor?: string,
  size = 50,
) => {
  const response = await apiGet<CursorResponse<FacilityRequestResponse>>(
    `/api/users/me/facility-requests${toQueryString({ cursor, size })}`,
  );

  const content = await Promise.all(
    response.content.map(async (summary) => {
      const id = summary.facilityRequestId ?? summary.id;
      if (!id) {
        return mapFacilityItem({ ...summary, ownedByCurrentUser: true });
      }

      try {
        const detail = await apiGet<FacilityRequestResponse>(
          `/api/facility-requests/${id}`,
        );
        return mapFacilityItem({
          ...summary,
          ...detail,
          ownedByCurrentUser: detail.ownedByCurrentUser ?? true,
        });
      } catch {
        return mapFacilityItem({ ...summary, ownedByCurrentUser: true });
      }
    }),
  );

  return { ...response, content };
};

export const getAllFacilityRequests = async (size = 50) => {
  const content: FacilityItem[] = [];
  let cursor: string | undefined;

  while (true) {
    const response = await getFacilityRequests(cursor, size);
    content.push(...response.content);

    const nextCursor = response.nextCursor ?? undefined;
    if (!response.hasNext || !nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  }

  return content;
};

export const getAllMyFacilityRequests = async () => {
  const content: FacilityItem[] = [];
  let cursor: string | undefined;

  do {
    const response = await getMyFacilityRequests(cursor, 50);
    content.push(...response.content);

    const nextCursor = response.nextCursor ?? undefined;
    if (!response.hasNext || !nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  } while (true);

  return content;
};

export const getFacilityRequest = async (id: number) =>
  mapFacilityItem(
    await apiGet<FacilityRequestResponse>(`/api/facility-requests/${id}`),
  );

export const createFacilityRequest = (request: CreateFacilityRequest) => {
  const formData = createFacilityRequestFormData(request);

  return apiRequest<FacilityRequestResponse>("/api/facility-requests", {
    method: "POST",
    body: formData,
  });
};

const createFacilityRequestFormData = (request: CreateFacilityRequest) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob(
      [
        JSON.stringify({
          title: request.title,
          description: request.description,
          categoryId: request.categoryId,
          locationId: request.locationId,
        }),
      ],
      { type: "application/json" },
    ),
  );
  // 백엔드 MultipartFile 파트명은 files이며, images로 보내면 글만 저장되고
  // 첨부파일은 조용히 무시된다.
  request.images.forEach((image) => formData.append("files", image));

  return formData;
};

export const updateFacilityRequest = (id: number, request: CreateFacilityRequest) =>
  apiRequest<FacilityRequestResponse>(`/api/facility-requests/${id}`, {
    method: "PATCH",
    body: createFacilityRequestFormData(request),
  });

export const deleteFacilityRequest = (id: number) =>
  apiRequest<void>(`/api/facility-requests/${id}`, { method: "DELETE" });
