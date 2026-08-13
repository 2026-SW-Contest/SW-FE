import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import logo from "../../../src/assets/icons/brand/logo-horizontal.svg";
import arrowLeftIcon from "../../../src/assets/icons/actions/arrow-left.svg";
import chevronRightIcon from "../../../src/assets/icons/actions/chevron-right.svg";
import plusIcon from "../../../src/assets/icons/actions/plus.svg";
import waitingStatusIcon from "../../../src/assets/icons/status/waiting.svg";
import inProgressStatusIcon from "../../../src/assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../../../src/assets/icons/status/resolved.svg";
import { getCurrentUser, logout } from "../../../src/api/auth";
import {
  getAdminFacilityRequest,
  getAdminFacilityRequests,
  toAdminFacilityStatus,
  updateAdminFacilityRequest,
} from "../../../src/api/adminFacility";
import { ApiError } from "../../../src/api/client";
import {
  getServerHealth,
  ServerHealthStatus,
} from "../../../src/api/health";
import { getStoredItem, getStoredItems } from "../../../src/api/lost";
import {
  createStoredItem,
  decideItemClaim,
  getItemClaim,
  getOfficeItemClaims,
  updateStoredItemStatus,
} from "../../../src/api/adminLost";
import {
  getItemCategories,
  getLocations,
  getLostItemOffices,
  LostItemOfficeResponse,
} from "../../../src/api/reference";
import {
  initialLostItems,
  initialOwnerRequests,
  statusLabel,
} from "./mock";
import {
  AdminFacilityItem,
  AdminLostItem,
  AdminSection,
  AdminStatus,
  OwnerRequest,
} from "./types";

const navItems: Array<{ key: AdminSection; label: string; description: string }> = [
  { key: "dashboard", label: "대시보드", description: "운영 현황" },
  { key: "lost", label: "분실물 관리", description: "등록 및 반환 처리" },
  { key: "requests", label: "소유자 확인 요청", description: "승인 및 반려" },
  { key: "facility", label: "시설·기자재 문의", description: "문의 상태 관리" },
  { key: "account", label: "계정 정보", description: "로그인 및 권한 확인" },
];

const pageTitle: Record<AdminSection, [string, string]> = {
  dashboard: ["대시보드", "오늘 처리해야 할 커넥띵 운영 현황입니다."],
  lost: ["분실물 관리", "접수된 분실물을 등록하고 반환 상태를 관리합니다."],
  requests: ["소유자 확인 요청", "학생이 제출한 증빙자료를 확인하고 결과를 전달합니다."],
  facility: ["시설·기자재 문의", "접수된 문의의 진행 상태와 관리자 답변을 관리합니다."],
  account: ["계정 정보", "현재 로그인한 관리자 계정과 세션 상태를 확인합니다."],
};

interface AdminAccount {
  userId: number;
  email: string;
  name?: string;
  studentNumber?: string;
  roles: string[];
}

const ADMIN_AUTH_KEY = "connecthingAdminAuth";
const getStudentLoginUrl = () => {
  const studentAppUrl = import.meta.env.VITE_STUDENT_APP_URL ||
    (import.meta.env.DEV ? "http://localhost:5173" : window.location.origin);
  return `${studentAppUrl.replace(/\/$/, "")}/login`;
};

const readAdminAccount = (): AdminAccount | null => {
  const hashPayload = new URLSearchParams(window.location.hash.slice(1)).get("auth");

  try {
    if (hashPayload) {
      const account = JSON.parse(
        decodeURIComponent(window.atob(hashPayload)),
      ) as AdminAccount;
      sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(account));
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      return account;
    }

    const storedAccount = sessionStorage.getItem(ADMIN_AUTH_KEY);
    return storedAccount ? (JSON.parse(storedAccount) as AdminAccount) : null;
  } catch {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
};

const StatusBadge = ({ status }: { status: AdminStatus }) => (
  <span className="admin-status" aria-label={statusLabel[status]}>
    <img
      src={
        status === "waiting"
          ? waitingStatusIcon
          : status === "inProgress"
            ? inProgressStatusIcon
            : resolvedStatusIcon
      }
      alt={statusLabel[status]}
    />
  </span>
);

const EmptyRow = ({ colSpan, message = "표시할 항목이 없습니다." }: { colSpan: number; message?: string }) => (
  <tr>
    <td className="admin-empty-row" colSpan={colSpan}>{message}</td>
  </tr>
);

const RequiredMark = () => <span className="admin-required">*</span>;

const toAdminLostStatus = (status: string): AdminStatus =>
  status === "resolved"
    ? "resolved"
    : status === "inProgress"
      ? "inProgress"
      : "waiting";

const toStoredItemStatus = (status: AdminStatus) =>
  status === "resolved"
    ? "COMPLETED" as const
    : status === "inProgress"
      ? "IN_PROGRESS" as const
      : "STORED" as const;

interface LostRegistrationInput {
  title: string;
  officeId: number;
  categoryId: number;
  categoryName: string;
  locationId: number;
  locationName: string;
  detailLocation: string;
  storageLocation: string;
  foundDate: string;
  detail: string;
  status: AdminStatus;
  image: File;
}

const AccountPanel = ({
  account,
  sessionState,
}: {
  account: AdminAccount | null;
  sessionState: "checking" | "active" | "expired";
}) => (
  <section className="admin-account-page">
    <div className="admin-account-card">
      <div className="admin-account-card-header">
        <span className="admin-account-large-avatar">관</span>
        <div>
          <h2>{account?.name || "관리자 계정"}</h2>
          <p>{account?.email || "로그인 응답 정보가 없습니다."}</p>
        </div>
        <span className={`admin-session-badge ${sessionState}`}>
          {sessionState === "checking"
            ? "세션 확인 중"
            : sessionState === "active"
              ? "세션 유효"
              : "세션 만료"}
        </span>
      </div>

      <dl className="admin-account-details">
        <div><dt>사용자 ID</dt><dd>{account?.userId ?? "-"}</dd></div>
        <div><dt>이메일</dt><dd>{account?.email || "-"}</dd></div>
        <div><dt>이름</dt><dd>{account?.name || "백엔드 응답 없음"}</dd></div>
        <div><dt>학번</dt><dd>{account?.studentNumber || "백엔드 응답 없음"}</dd></div>
        <div className="admin-account-role-row">
          <dt>권한</dt>
          <dd>
            {account?.roles?.length
              ? account.roles.map((role) => (
                  <span key={role} className="admin-role-badge">{role}</span>
                ))
              : "-"}
          </dd>
        </div>
      </dl>

      <p className="admin-account-note">
        계정 정보는 로그인 성공 응답 기준이며, 세션 상태는 인증 필요 API를 통해 확인합니다.
      </p>
    </div>
  </section>
);

const AdminApp = () => {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [lostItems, setLostItems] = useState(initialLostItems);
  const [ownerRequests, setOwnerRequests] = useState(initialOwnerRequests);
  const [facilityItems, setFacilityItems] = useState<AdminFacilityItem[]>([]);
  const [facilityTotalElements, setFacilityTotalElements] = useState(0);
  const [isFacilityLoading, setIsFacilityLoading] = useState(true);
  const [facilityError, setFacilityError] = useState("");
  const [showLostForm, setShowLostForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<AdminFacilityItem | null>(null);
  const [isFacilityDetailLoading, setIsFacilityDetailLoading] = useState(false);
  const [facilityDetailError, setFacilityDetailError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [account, setAccount] = useState<AdminAccount | null>(readAdminAccount);
  const [sessionState, setSessionState] = useState<"checking" | "active" | "expired">(
    "checking",
  );
  const [serverHealth, setServerHealth] = useState<
    ServerHealthStatus | "CHECKING"
  >("CHECKING");
  const hasAccount = account !== null;

  useEffect(() => {
    let active = true;

    const checkHealth = () => {
      void getServerHealth()
        .then((response) => {
          if (active) setServerHealth(response.status === "UP" ? "UP" : "DOWN");
        })
        .catch(() => {
          if (active) setServerHealth("DOWN");
        });
    };

    checkHealth();
    const intervalId = window.setInterval(checkHealth, 30_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!hasAccount) {
      window.location.replace(getStudentLoginUrl());
      return;
    }

    let active = true;
    setSessionState("checking");
    void getCurrentUser()
      .then((user) => {
        if (!active) return;
        const nextAccount: AdminAccount = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          studentNumber: user.studentNumber,
          roles: user.roles,
        };
        setAccount(nextAccount);
        sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(nextAccount));
        setSessionState("active");
      })
      .catch((error) => {
        if (!active) return;
        setSessionState("expired");

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          window.location.replace(getStudentLoginUrl());
        }
      });

    return () => {
      active = false;
    };
  }, [hasAccount]);

  useEffect(() => {
    if (!hasAccount) return;
    if (section !== "dashboard" && section !== "facility") return;

    let active = true;
    setIsFacilityLoading(true);
    setFacilityError("");

    const requestTimer = window.setTimeout(() => {
      void getAdminFacilityRequests({
        keyword: section === "facility" ? query.trim() || undefined : undefined,
        status:
          section === "facility" ? toAdminFacilityStatus(statusFilter) : undefined,
        page: 0,
        size: 100,
      })
      .then((response) => {
        if (!active) return;
        setFacilityItems(response.content);
        setFacilityTotalElements(response.totalElements);
      })
      .catch((error) => {
        if (!active) return;
        setFacilityItems([]);
        setFacilityTotalElements(0);
        setFacilityError(
          error instanceof Error
            ? error.message
            : "시설·기자재 문의를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (active) setIsFacilityLoading(false);
      });
    }, section === "facility" ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(requestTimer);
    };
  }, [hasAccount, query, section, statusFilter]);

  useEffect(() => {
    if (!hasAccount) return;
    if (!["dashboard", "lost", "requests"].includes(section)) return;

    let active = true;
    void getStoredItems({ size: 50 })
      .then(async (response) => {
        const detailedItems = await Promise.all(
          response.content.map((summary) =>
            getStoredItem(summary.id).catch(() => summary),
          ),
        );
        if (!active) return;

        setLostItems(detailedItems.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          location: item.foundLocation ?? item.location,
          storageLocation: item.storageLocation ?? "-",
          foundDate: item.foundDate ?? item.date,
          status: toAdminLostStatus(item.status),
        })));

        if (!["dashboard", "requests"].includes(section)) return;
        const offices = await getLostItemOffices();
        const claimGroups = await Promise.all(
          offices.map(async (office) =>
            getOfficeItemClaims(office.officeId, { size: 50 })
              .then((result) => result.content)
              .catch(() => []),
          ),
        );
        if (!active) return;

        const claims = Array.from(
          new Map(
            claimGroups.flat().map((claim) => [claim.itemClaimId, claim]),
          ).values(),
        ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));

        setOwnerRequests(claims.map((claim) => ({
            id: claim.itemClaimId,
            lostItemId: claim.storedItemId,
            itemTitle: claim.itemName,
            applicant: claim.claimantName,
            studentNumber: claim.studentNumber ?? "-",
            submittedAt: claim.createdAt.replace("T", " ").slice(0, 16),
            evidence: "증빙 내용을 불러오는 중입니다.",
            status:
              claim.claimStatus === "APPROVED"
                ? "resolved"
                : claim.claimStatus === "REJECTED"
                  ? "inProgress"
                  : "waiting",
            result:
              claim.claimStatus === "APPROVED"
                ? "approved"
                : claim.claimStatus === "REJECTED"
                  ? "rejected"
                  : undefined,
          })),
        );
      })
      .catch(() => {
        // 분실물 전체 조회 실패 시 기존 화면 데이터를 유지한다.
      });

    return () => {
      active = false;
    };
  }, [hasAccount, section]);

  const filterBySearchAndStatus = <T extends { title: string; status: AdminStatus }>(
    items: T[],
  ) => items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) &&
    (statusFilter === "all" || item.status === statusFilter),
  );

  const filteredLostItems = useMemo(
    () => filterBySearchAndStatus(lostItems),
    [lostItems, query, statusFilter],
  );
  const filteredRequests = useMemo(
    () => ownerRequests.filter((request) =>
      `${request.itemTitle} ${request.applicant} ${request.studentNumber}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (statusFilter === "all" || request.status === statusFilter),
    ),
    [ownerRequests, query, statusFilter],
  );

  const changeSection = (nextSection: AdminSection) => {
    setSection(nextSection);
    setQuery("");
    setStatusFilter("all");
  };

  const updateLostStatus = (id: number, status: AdminStatus) => {
    void updateStoredItemStatus(id, toStoredItemStatus(status))
      .then(() => {
        setLostItems((items) =>
          items.map((item) => item.id === id ? { ...item, status } : item),
        );
      })
      .catch(() => undefined);
  };

  const openOwnerRequest = (request: OwnerRequest) => {
    setSelectedRequest(request);
    void getItemClaim(request.id)
      .then((detail) => {
        setSelectedRequest((current) => current?.id === request.id
          ? { ...current, evidence: detail.ownershipDescription }
          : current);
      })
      .catch(() => undefined);
  };

  const openFacilityDetail = (item: AdminFacilityItem) => {
    setSelectedFacility(item);
    setIsFacilityDetailLoading(true);
    setFacilityDetailError("");

    void getAdminFacilityRequest(item.id)
      .then((detail) => {
        setSelectedFacility((current) =>
          current?.id === item.id
            ? { ...current, ...detail }
            : current,
        );
      })
      .catch((error) => {
        setFacilityDetailError(
          error instanceof Error
            ? error.message
            : "첨부사진을 불러오지 못했습니다.",
        );
      })
      .finally(() => setIsFacilityDetailLoading(false));
  };

  const processOwnerRequest = async (
    request: OwnerRequest,
    result: "approved" | "rejected",
    message: string,
  ) => {
    await decideItemClaim(
      request.id,
      result === "approved" ? "APPROVED" : "REJECTED",
      message.trim() || undefined,
    );
    const nextStatus: AdminStatus = result === "approved" ? "resolved" : "inProgress";

    setOwnerRequests((requests) => requests.map((item) =>
      item.id === request.id
        ? { ...item, status: nextStatus, result, resultMessage: message }
        : item,
    ));
    updateLostStatus(request.lostItemId, nextStatus);
    setSelectedRequest(null);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    const finishLogout = () => {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      window.location.replace(getStudentLoginUrl());
    };

    try {
      await logout();
      finishLogout();
    } catch (error) {
      // 세션이 이미 만료됐거나 CSRF가 더 이상 유효하지 않다면
      // 서버 관점에서도 사용할 수 없는 로그인 상태이므로 로컬 로그아웃을 완료한다.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        finishLogout();
        return;
      }

      setLogoutError(
        error instanceof Error ? error.message : "로그아웃에 실패했습니다.",
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Connecthing" />
          <span>ADMIN</span>
        </div>

        <nav className="admin-nav" aria-label="관리자 메뉴">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={section === item.key ? "active" : ""}
              onClick={() => changeSection(item.key)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </nav>

        <div className="admin-account">
          <span className="admin-account-avatar">관</span>
          <span className="admin-account-copy">
            <strong>{account?.name || "관리자"}</strong>
            <small>{account?.email || "계정 정보 확인"}</small>
          </span>
          <button
            type="button"
            className="admin-logout-button"
            onClick={() => {
              setLogoutError("");
              setShowLogoutModal(true);
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{pageTitle[section][0]}</h1>
            <p>{pageTitle[section][1]}</p>
          </div>
          <div className="admin-header-meta">
            <span className={`admin-server-health ${serverHealth.toLowerCase()}`}>
              <span aria-hidden="true" />
              {serverHealth === "CHECKING"
                ? "서버 확인 중"
                : serverHealth === "UP"
                  ? "서버 정상"
                  : "서버 장애"}
            </span>
            <span className="admin-date">2026.08.12</span>
          </div>
        </header>

        {section === "account" ? (
          <AccountPanel account={account} sessionState={sessionState} />
        ) : section === "dashboard" ? (
          <Dashboard
            lostItems={lostItems}
            requests={ownerRequests}
            facilityItems={facilityItems}
            onNavigate={changeSection}
          />
        ) : (
          <>
            <section className="admin-toolbar">
              <label className="admin-search">
                <span>검색</span>
                <input
                  value={query}
                  placeholder="제목, 신청자 또는 학번 검색"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="admin-filter">
                <span>상태</span>
                <div className="admin-filter-control">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as AdminStatus | "all")
                    }
                  >
                    <option value="all">전체 상태</option>
                    <option value="waiting">
                      {section === "lost" ? "보관중" : "대기"}
                    </option>
                    <option value="inProgress">진행중</option>
                    <option value="resolved">해결완료</option>
                  </select>
                </div>
              </label>
              {section === "lost" && (
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() => setShowLostForm(true)}
                >
                  분실물 등록
                </button>
              )}
            </section>

            {section === "lost" && (
              <LostTable items={filteredLostItems} onStatusChange={updateLostStatus} />
            )}
            {section === "requests" && (
              <RequestTable items={filteredRequests} onSelect={openOwnerRequest} />
            )}
            {section === "facility" && (
              <FacilityTable
                items={facilityItems}
                totalElements={facilityTotalElements}
                isLoading={isFacilityLoading}
                error={facilityError}
                onSelect={openFacilityDetail}
              />
            )}
          </>
        )}
      </main>

      {showLostForm && (
        <LostRegistrationModal
          onClose={() => setShowLostForm(false)}
          onSubmit={async (input) => {
            const response = await createStoredItem(
              {
                officeId: input.officeId,
                categoryId: input.categoryId,
                foundLocationId: input.locationId,
                itemName: input.title,
                description: input.detail.trim() || input.title,
                privateDescription: input.detailLocation.trim() || undefined,
                foundDate: input.foundDate,
              },
              [input.image],
            );
            if (input.status !== "waiting") {
              await updateStoredItemStatus(
                response.storedItemId,
                toStoredItemStatus(input.status),
              );
            }

            setLostItems((items) => [{
              id: response.storedItemId,
              title: input.title,
              category: input.categoryName,
              location: [input.locationName, input.detailLocation]
                .filter(Boolean)
                .join(" "),
              storageLocation: input.storageLocation,
              foundDate: input.foundDate.replaceAll("-", "."),
              status: input.status,
            }, ...items]);
            setShowLostForm(false);
          }}
        />
      )}
      {selectedRequest && (
        <OwnerRequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onProcess={processOwnerRequest}
        />
      )}
      {selectedFacility && (
        <FacilityDrawer
          item={selectedFacility}
          isLoading={isFacilityDetailLoading}
          detailError={facilityDetailError}
          onClose={() => setSelectedFacility(null)}
          onSave={async (status, answer) => {
            const nextStatus = toAdminFacilityStatus(status);
            const currentStatus = toAdminFacilityStatus(selectedFacility.status);
            const trimmedAnswer = answer.trim();
            const response = await updateAdminFacilityRequest(selectedFacility.id, {
              status: nextStatus !== currentStatus ? nextStatus : undefined,
              adminResponse: trimmedAnswer || undefined,
            });

            setFacilityItems((items) => items.map((item) =>
              item.id === selectedFacility.id
                ? {
                    ...item,
                    status,
                    statusName: response.requestStatusName,
                  }
                : item,
            ));
            setSelectedFacility((current) => current
              ? {
                  ...current,
                  status,
                  statusName: response.requestStatusName,
                  updatedAt: response.updatedAt,
                  adminResponses: response.adminResponse
                    ? [...(current.adminResponses ?? []), response.adminResponse]
                    : current.adminResponses,
                }
              : current,
            );
          }}
        />
      )}
      {showLogoutModal && (
        <div
          className="admin-confirm-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <section
            className="admin-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-logout-title"
          >
            <h2 id="admin-logout-title">로그아웃 하시겠습니까?</h2>
            <p>로그아웃하면 관리자 로그인 페이지로 이동합니다.</p>
            {logoutError && <p className="admin-confirm-error">{logoutError}</p>}
            <div className="admin-confirm-actions">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="primary"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                {isLoggingOut ? "로그아웃 중" : "로그아웃"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({
  lostItems,
  requests,
  facilityItems,
  onNavigate,
}: {
  lostItems: AdminLostItem[];
  requests: OwnerRequest[];
  facilityItems: AdminFacilityItem[];
  onNavigate: (section: AdminSection) => void;
}) => {
  const cards = [
    { label: "보관중 분실물", value: lostItems.filter((item) => item.status === "waiting").length, section: "lost" as const },
    { label: "진행중 소유자 요청", value: requests.filter((item) => item.status === "inProgress").length, section: "requests" as const },
    { label: "진행중 시설 문의", value: facilityItems.filter((item) => item.status === "inProgress").length, section: "facility" as const },
    { label: "오늘 해결완료", value: [...lostItems, ...facilityItems].filter((item) => item.status === "resolved").length, section: "dashboard" as const },
  ];

  return (
    <>
      <section className="admin-summary-grid">
        {cards.map((card) => (
          <button key={card.label} type="button" onClick={() => onNavigate(card.section)}>
            <span>{card.label}</span><strong>{card.value}</strong><small>건</small>
          </button>
        ))}
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div><h2>최근 소유자 확인 요청</h2><p>증빙 확인이 필요한 요청입니다.</p></div>
            <button type="button" onClick={() => onNavigate("requests")}>전체보기</button>
          </div>
          <ul className="admin-activity-list">
            {requests.slice(0, 5).map((request) => (
              <li key={request.id}>
                <span><strong>{request.itemTitle}</strong><small>{request.applicant} · {request.studentNumber}</small></span>
                <StatusBadge status={request.status} />
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div><h2>최근 시설·기자재 문의</h2><p>상태 변경이 필요한 문의입니다.</p></div>
            <button type="button" onClick={() => onNavigate("facility")}>전체보기</button>
          </div>
          <ul className="admin-activity-list">
            {facilityItems.slice(0, 5).map((item) => (
              <li key={item.id}>
                <span><strong>{item.title}</strong><small>{item.location}</small></span>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
};

const LostTable = ({ items, onStatusChange }: {
  items: AdminLostItem[];
  onStatusChange: (id: number, status: AdminStatus) => void;
}) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>분실물 목록</h2><span>총 {items.length}건</span></div>
    <table><thead><tr><th>번호</th><th>게시글 제목</th><th>카테고리</th><th>습득 장소</th><th>보관 장소</th><th>습득 일자</th><th>처리 상태</th></tr></thead>
      <tbody>{items.length === 0 ? <EmptyRow colSpan={7} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.title}</td><td>{item.category}</td><td>{item.location}</td><td>{item.storageLocation}</td><td>{item.foundDate}</td><td>
          <select className={`admin-status-select ${item.status}`} value={item.status} onChange={(event) => onStatusChange(item.id, event.target.value as AdminStatus)}>
            <option value="waiting">보관중</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option>
          </select>
        </td></tr>
      ))}</tbody>
    </table>
  </section>
);

const RequestTable = ({ items, onSelect }: { items: OwnerRequest[]; onSelect: (item: OwnerRequest) => void }) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>소유자 확인 요청 목록</h2><span>총 {items.length}건</span></div>
    <table><thead><tr><th>요청 번호</th><th>대상 분실물</th><th>신청자</th><th>학번</th><th>신청 일시</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>{items.length === 0 ? <EmptyRow colSpan={7} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.itemTitle}</td><td>{item.applicant}</td><td>{item.studentNumber}</td><td>{item.submittedAt}</td><td><StatusBadge status={item.status} /></td><td><button type="button" className="admin-table-action" onClick={() => onSelect(item)}>검토하기</button></td></tr>
      ))}</tbody>
    </table>
  </section>
);

const FacilityTable = ({ items, totalElements, isLoading, error, onSelect }: {
  items: AdminFacilityItem[];
  totalElements: number;
  isLoading: boolean;
  error: string;
  onSelect: (item: AdminFacilityItem) => void;
}) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>시설·기자재 문의 목록</h2><span>총 {totalElements}건</span></div>
    <table><thead><tr><th>번호</th><th>문의 제목</th><th>신청자</th><th>학번</th><th>카테고리</th><th>장소</th><th>등록일</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>{isLoading ? (
        <EmptyRow colSpan={9} message="시설·기자재 문의를 불러오는 중입니다." />
      ) : error ? (
        <EmptyRow colSpan={9} message={error} />
      ) : items.length === 0 ? <EmptyRow colSpan={9} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.title}</td><td>{item.requesterName ?? "-"}</td><td>{item.studentNumber ?? "-"}</td><td>{item.category}</td><td>{item.location}</td><td>{item.submittedAt}</td><td><StatusBadge status={item.status} /></td><td><button type="button" className="admin-table-action" onClick={() => onSelect(item)}>관리하기</button></td></tr>
      ))}</tbody>
    </table>
  </section>
);

const LostRegistrationModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: LostRegistrationInput) => Promise<void> }) => {
  const [representativeImage, setRepresentativeImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [locations, setLocations] = useState<Array<{
    locationId: number;
    locationCode: string | null;
    locationName: string;
  }>>([]);
  const [categories, setCategories] = useState<Array<{
    categoryId: number;
    categoryName: string;
  }>>([]);
  const [offices, setOffices] = useState<LostItemOfficeResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      getLocations(),
      getItemCategories(),
      getLostItemOffices(),
    ])
      .then(([locationItems, categoryItems, officeItems]) => {
        if (!active) return;
        setLocations(locationItems);
        setCategories(categoryItems);
        setOffices(officeItems);
      })
      .catch((error) => {
        if (active) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "기준정보를 불러오지 못했습니다.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!representativeImage) {
      setPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(representativeImage);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [representativeImage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!representativeImage || isSubmitting) return;

    const data = new FormData(event.currentTarget);
    const categoryId = Number(data.get("categoryId"));
    const locationId = Number(data.get("locationId"));
    const officeId = Number(data.get("officeId"));
    const category = categories.find((item) => item.categoryId === categoryId);
    const location = locations.find((item) => item.locationId === locationId);
    const office = offices.find((item) => item.officeId === officeId);

    if (!office) {
      setSubmitError("분실물 보관소를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
      title: String(data.get("title")),
      officeId,
      categoryId,
      categoryName: category?.categoryName ?? "기타",
      locationId,
      locationName: [location?.locationCode, location?.locationName]
        .filter(Boolean)
        .join(" "),
      detailLocation: String(data.get("detailLocation")),
      storageLocation: [
        office.buildingCode,
        office.buildingName,
        office.floor,
        office.locationName,
      ].filter(Boolean).join(" "),
      foundDate: String(data.get("foundDate")),
      detail: String(data.get("detail")),
      status: data.get("status") as AdminStatus,
      image: representativeImage,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "분실물 등록에 실패했습니다.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form className="admin-modal" onSubmit={handleSubmit}>
        <div className="admin-modal-header"><div><h2>분실물 게시글 등록</h2><p>필수 정보를 입력해 학생 서비스에 게시합니다.</p></div><button type="button" onClick={onClose}>×</button></div>
        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <span>대표 사진 <RequiredMark /></span>
            <label
              htmlFor="admin-lost-photo"
              className={`admin-photo-uploader ${previewUrl ? "has-image" : ""}`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="대표 사진 미리보기" />
              ) : (
                <div className="admin-photo-placeholder">
                  <span className="admin-photo-icon"><img src={plusIcon} alt="" /></span>
                  <strong>대표 사진을 등록해주세요</strong>
                  <small>JPG, PNG 등 이미지 파일을 선택할 수 있습니다.</small>
                </div>
              )}
              {previewUrl && <span className="admin-photo-change-hint">클릭하여 사진 교체</span>}
              <input
                id="admin-lost-photo"
                name="representativeImage"
                type="file"
                accept="image/*"
                required
                className="admin-photo-input"
                onChange={(event) =>
                  setRepresentativeImage(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {representativeImage && (
              <span className="admin-photo-filename">{representativeImage.name}</span>
            )}
          </div>
          <label className="admin-field admin-field-wide"><span>게시글 제목 <RequiredMark /></span><input name="title" required placeholder="분실물의 특징이 드러나는 제목" /></label>
          <label className="admin-field"><span>처리 상태 <RequiredMark /></span><select name="status" required><option value="waiting">보관중</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option></select></label>
          <label className="admin-field"><span>습득 일자 <RequiredMark /></span><input name="foundDate" type="date" required /></label>
          <label className="admin-field"><span>습득 장소 <RequiredMark /></span><select name="locationId" required disabled={!locations.length}>{locations.map((location) => <option key={location.locationId} value={location.locationId}>{[location.locationCode, location.locationName].filter(Boolean).join(" ")}</option>)}</select></label>
          <label className="admin-field"><span>상세 위치</span><input name="detailLocation" placeholder="예: 1층 로비" /></label>
          <label className="admin-field"><span>카테고리 <RequiredMark /></span><select name="categoryId" required disabled={!categories.length}>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label>
          <label className="admin-field"><span>보관 장소 <RequiredMark /></span><select name="officeId" required disabled={!offices.length}>{offices.map((office) => <option key={office.officeId} value={office.officeId}>{[office.buildingCode, office.buildingName, office.floor, office.locationName].filter(Boolean).join(" ")}{office.primary ? " · 대표" : ""}</option>)}</select></label>
          <label className="admin-field admin-field-wide"><span>물건 상세 정보</span><textarea name="detail" rows={4} placeholder="물건의 색상, 특징, 구성품 등을 입력하세요." /></label>
        </div>
        {submitError && <p className="admin-confirm-error">{submitError}</p>}
        <div className="admin-modal-actions"><button type="button" disabled={isSubmitting} onClick={onClose}>취소</button><button type="submit" disabled={isSubmitting || !locations.length || !categories.length || !offices.length} className="admin-primary-button">{isSubmitting ? "등록 중" : "등록하기"}</button></div>
      </form>
    </div>
  );
};

const OwnerRequestDrawer = ({ request, onClose, onProcess }: { request: OwnerRequest; onClose: () => void; onProcess: (request: OwnerRequest, result: "approved" | "rejected", message: string) => Promise<void> }) => {
  const [result, setResult] = useState<"approved" | "rejected">("approved");
  const [message, setMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState("");
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  const closeWithAnimation = (afterClose: () => void = onClose) => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(afterClose, 280);
  };

  const handleProcess = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessError("");
    try {
      await onProcess(request, result, message);
      setIsProcessing(false);
      closeWithAnimation();
    } catch (error) {
      setProcessError(
        error instanceof Error ? error.message : "요청 처리에 실패했습니다.",
      );
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWithAnimation();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  return (
    <div
      className={`admin-drawer-backdrop ${isClosing ? "closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeWithAnimation();
      }}
    >
      <aside className={`admin-drawer ${isClosing ? "closing" : ""}`} role="dialog" aria-modal="true" aria-label="소유자 확인 요청 처리">
        <div className="admin-modal-header"><div><h2>소유자 확인 요청 처리</h2><p>요청 #{request.id}</p></div><button type="button" onClick={() => closeWithAnimation()}>×</button></div>
        <section className="admin-detail-box"><h3>{request.itemTitle}</h3><dl><div><dt>신청자</dt><dd>{request.applicant}</dd></div><div><dt>학번</dt><dd>{request.studentNumber}</dd></div><div><dt>신청 일시</dt><dd>{request.submittedAt}</dd></div></dl></section>
        <section className="admin-detail-section"><h3>제출한 증빙 내용</h3><p>{request.evidence}</p></section>
        <section className="admin-detail-section"><h3>처리 결과</h3><div className="admin-segmented"><button type="button" className={result === "approved" ? "active" : ""} onClick={() => setResult("approved")}>승인</button><button type="button" className={result === "rejected" ? "active danger" : ""} onClick={() => setResult("rejected")}>반려</button></div></section>
        {result === "approved" ? (
          <><label className="admin-field"><span>방문 장소 *</span><select><option>S1 본관(종합관) 1층 경비실</option><option>S9 방목학술정보관 안내데스크</option><option>S10 MCC관 1층 경비실</option></select></label><div className="admin-notice-preview"><strong>신청자 자동 알림</strong><p>본인 확인이 완료되었습니다. 해당 물건의 증빙자료를 지참하여 방문해주세요.</p><small>운영시간 09:00 ~ 17:00</small></div></>
        ) : (
          <label className="admin-field"><span>반려 사유 *</span><textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="신청자에게 전달할 반려 사유를 입력하세요." /></label>
        )}
        {processError && <p className="admin-drawer-error">{processError}</p>}
        <div className="admin-drawer-actions"><button type="button" disabled={isProcessing} onClick={() => closeWithAnimation()}>취소</button><button type="button" className="admin-primary-button" disabled={isProcessing || (result === "rejected" && !message.trim())} onClick={() => void handleProcess()}>{isProcessing ? "처리 중" : "처리 완료"}</button></div>
      </aside>
    </div>
  );
};

const FacilityDrawer = ({ item, isLoading, detailError, onClose, onSave }: { item: AdminFacilityItem; isLoading: boolean; detailError: string; onClose: () => void; onSave: (status: AdminStatus, answer: string) => Promise<void> }) => {
  const [status, setStatus] = useState(item.status);
  const [answer, setAnswer] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const closeTimerRef = useRef<number | null>(null);
  const imageUrls = item.imageUrls?.length
    ? item.imageUrls
    : item.thumbnailUrl
      ? [item.thumbnailUrl]
      : [];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [item.id, item.imageUrls]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isImageViewerOpen) return;

    const handleViewerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageViewerOpen(false);
        return;
      }
      if (imageUrls.length < 2) return;
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", handleViewerKeyDown);
    return () => window.removeEventListener("keydown", handleViewerKeyDown);
  }, [imageUrls.length, isImageViewerOpen]);

  const showPreviousImage = () => {
    setActiveImageIndex((index) =>
      index === 0 ? imageUrls.length - 1 : index - 1,
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % imageUrls.length);
  };

  const closeWithAnimation = (afterClose: () => void = onClose) => {
    if (isClosing || isSaving) return;
    setIsImageViewerOpen(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(afterClose, 280);
  };

  useEffect(() => {
    if (isImageViewerOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWithAnimation();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  const handleSave = async () => {
    if (isSaving) return;
    const hasStatusChange = status !== item.status;
    const hasAnswer = Boolean(answer.trim());

    if (!hasStatusChange && !hasAnswer) {
      setSaveError("처리 상태를 변경하거나 관리자 답변을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      await onSave(status, answer);
      setIsSaving(false);
      closeWithAnimation();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "시설 문의 처리 내용을 저장하지 못했습니다.",
      );
      setIsSaving(false);
    }
  };

  const availableStatuses: AdminStatus[] = item.status === "waiting"
    ? ["waiting", "inProgress", "resolved"]
    : item.status === "inProgress"
      ? ["inProgress", "resolved"]
      : ["resolved"];

  return (
    <div
      className={`admin-drawer-backdrop ${isClosing ? "closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeWithAnimation();
      }}
    ><aside className={`admin-drawer ${isClosing ? "closing" : ""}`} role="dialog" aria-modal="true" aria-label="시설 문의 처리" tabIndex={-1} onKeyDown={(event) => {
      if (isImageViewerOpen) return;
      if (imageUrls.length < 2 || ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName)) return;
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    }}>
      <div className="admin-modal-header"><div><h2>시설·기자재 문의 처리</h2><p>문의 #{item.id}</p></div><button type="button" onClick={() => closeWithAnimation()}>×</button></div>
      <section className={`admin-facility-media ${imageUrls.length ? "has-image" : "is-empty"}`}>
        {isLoading ? (
          <span>첨부사진을 불러오는 중입니다.</span>
        ) : imageUrls.length ? (
          <>
            <div className="admin-facility-main-image">
              <button
                type="button"
                className="admin-facility-image-open"
                aria-label="첨부사진 전체화면으로 보기"
                onClick={() => setIsImageViewerOpen(true)}
              >
                <img key={imageUrls[activeImageIndex]} src={imageUrls[activeImageIndex]} alt={`${item.title} 첨부사진 ${activeImageIndex + 1}`} />
              </button>
              {imageUrls.length > 1 && (
                <>
                  <div className="admin-facility-image-controls">
                    <button type="button" className="admin-facility-image-nav previous" aria-label="이전 사진" onClick={showPreviousImage}>
                      <img src={arrowLeftIcon} alt="" />
                    </button>
                    <button type="button" className="admin-facility-image-nav next" aria-label="다음 사진" onClick={showNextImage}>
                      <img src={chevronRightIcon} alt="" />
                    </button>
                  </div>
                  <span className="admin-facility-image-count">{activeImageIndex + 1} / {imageUrls.length}</span>
                </>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div className="admin-facility-thumbnails" aria-label="첨부사진 목록">
                {imageUrls.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    className={index === activeImageIndex ? "active" : ""}
                    aria-label={`${index + 1}번째 첨부사진 보기`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={imageUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <span>{detailError || "등록된 첨부사진이 없습니다."}</span>
        )}
      </section>
      <section className="admin-detail-box"><h3>{item.title}</h3><dl><div><dt>신청자</dt><dd>{item.requesterName ?? "-"}</dd></div><div><dt>학번</dt><dd>{item.studentNumber ?? "-"}</dd></div><div><dt>이메일</dt><dd>{item.requesterEmail || "-"}</dd></div><div><dt>카테고리</dt><dd>{item.category}</dd></div><div><dt>장소</dt><dd>{item.location}</dd></div><div><dt>등록일</dt><dd>{item.submittedAt}</dd></div></dl></section>
      {item.description && <section className="admin-detail-section"><h3>문의 내용</h3><p>{item.description}</p></section>}
      {detailError && <p className="admin-drawer-error">{detailError}</p>}
      {(item.adminResponses?.length ?? 0) > 0 && (
        <section className="admin-detail-section admin-response-history">
          <h3>관리자 답변 내역</h3>
          <ul>
            {item.adminResponses?.map((response) => (
              <li key={response.responseId}>
                <p>{response.content}</p>
                <time>{new Date(response.createdAt).toLocaleString("ko-KR")}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
      <label className="admin-field"><span>처리 상태 *</span><select value={status} disabled={item.status === "resolved" || isSaving} onChange={(event) => setStatus(event.target.value as AdminStatus)}>{availableStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
      <label className="admin-field"><span>관리자 답변</span><textarea rows={7} maxLength={2000} disabled={item.status === "resolved" || isSaving} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={item.status === "resolved" ? "해결 완료된 문의는 추가 처리할 수 없습니다." : "학생에게 전달할 처리 내용을 입력하세요."} /></label>
      {saveError && <p className="admin-drawer-error">{saveError}</p>}
      <div className="admin-drawer-actions"><button type="button" disabled={isSaving} onClick={() => closeWithAnimation()}>취소</button><button type="button" className="admin-primary-button" disabled={item.status === "resolved" || isSaving || isLoading} onClick={() => void handleSave()}>{isSaving ? "저장 중" : "저장하기"}</button></div>
    </aside>
      {isImageViewerOpen && imageUrls.length > 0 && (
        <div
          className="admin-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="첨부사진 전체화면 보기"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsImageViewerOpen(false);
          }}
        >
          <button
            type="button"
            className="admin-image-viewer-close"
            aria-label="전체화면 닫기"
            onClick={() => setIsImageViewerOpen(false)}
          >
            ×
          </button>
          <img
            key={imageUrls[activeImageIndex]}
            className="admin-image-viewer-content"
            src={imageUrls[activeImageIndex]}
            alt={`${item.title} 첨부사진 ${activeImageIndex + 1}`}
          />
          {imageUrls.length > 1 && (
            <>
              <button type="button" className="admin-image-viewer-nav previous" aria-label="이전 사진" onClick={showPreviousImage}>
                <img src={arrowLeftIcon} alt="" />
              </button>
              <button type="button" className="admin-image-viewer-nav next" aria-label="다음 사진" onClick={showNextImage}>
                <img src={chevronRightIcon} alt="" />
              </button>
              <span className="admin-image-viewer-count">{activeImageIndex + 1} / {imageUrls.length}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApp;
