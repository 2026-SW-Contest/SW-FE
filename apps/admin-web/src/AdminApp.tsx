import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout } from "../../../src/api/auth";
import {
  deleteAdminFacilityRequest,
  getAdminFacilityRequest,
  getAdminFacilityRequests,
  toAdminFacilityStatus,
  updateAdminFacilityRequest,
} from "../../../src/api/adminFacility";
import { ApiError } from "../../../src/api/client";
import { getUserErrorMessage } from "../../../src/utils/userErrorMessage";
import { getServerHealth, ServerHealthStatus } from "../../../src/api/health";
import { getStoredItem, getStoredItems } from "../../../src/api/lost";
import {
  createStoredItem,
  deleteStoredItem,
  decideItemClaim,
  getItemClaim,
  getAllOfficeItemClaims,
  getStoredItemForEdit,
  StoredItemEditDetail,
  updateStoredItem,
  updateStoredItemStatus,
} from "../../../src/api/adminLost";
import { getLostItemOffices } from "../../../src/api/reference";
import {
  AdminAccount,
  AdminFacilityItem,
  AdminLostItem,
  AdminSection,
  AdminStatus,
  OwnerRequest,
} from "./types";
import { ADMIN_AUTH_KEY, getStudentLoginUrl, readAdminAccount } from "./utils/adminAuth";
import { toAdminLostStatus, toStoredItemStatus } from "./utils/status";
import { AccountPanel } from "./components/account/AccountPanel";
import { Dashboard } from "./components/dashboard/Dashboard";
import { FacilityTable, LostTable, RequestTable } from "./components/tables/AdminTables";
import {
  LostEditInput,
  LostEditModal,
} from "./components/lost/LostEditModal";
import {
  LostRegistrationInput,
  LostRegistrationModal,
} from "./components/lost/LostRegistrationModal";
import { OwnerRequestDrawer } from "./components/requests/OwnerRequestDrawer";
import { FacilityDrawer } from "./components/facility/FacilityDrawer";
import { AdminHeader } from "./components/layout/AdminHeader";
import { AdminSidebar } from "./components/layout/AdminSidebar";
import { LogoutConfirmModal } from "./components/layout/LogoutConfirmModal";

const AdminApp = () => {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [lostItems, setLostItems] = useState<AdminLostItem[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>([]);
  const [facilityItems, setFacilityItems] = useState<AdminFacilityItem[]>([]);
  const [facilityTotalElements, setFacilityTotalElements] = useState(0);
  const [isFacilityLoading, setIsFacilityLoading] = useState(true);
  const [facilityError, setFacilityError] = useState("");
  const [showLostForm, setShowLostForm] = useState(false);
  const [editingLostItem, setEditingLostItem] = useState<StoredItemEditDetail | null>(null);
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
        setFacilityError(getUserErrorMessage(
          error,
          "시설·기자재 문의를 불러오지 못했습니다.",
        ));
      })
      .finally(() => {
        if (active) setIsFacilityLoading(false);
      });

    return () => {
      active = false;
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
            getAllOfficeItemClaims(office.officeId, { size: 50 }).catch(
              () => [],
            ),
          ),
        );
        if (!active) return;

        const claims = Array.from(
          new Map(
            claimGroups.flat().map((claim) => [claim.itemClaimId, claim]),
          ).values(),
        ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));

        setOwnerRequests(
          claims.map((claim) => ({
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

  const openLostEdit = (storedItemId: number) => {
    void getStoredItemForEdit(storedItemId)
      .then(setEditingLostItem)
      .catch(() => undefined);
  };

  const saveLostEdit = async (input: LostEditInput) => {
    if (!editingLostItem) return;

    const storedItemId = editingLostItem.storedItemId;
    await updateStoredItem(storedItemId, {
      officeId: input.officeId,
      categoryId: input.categoryId,
      foundLocationId: input.locationId,
      foundLocationText: input.detailLocation.trim() || undefined,
      itemName: input.title.trim(),
      description: input.description.trim(),
      foundDate: input.foundDate,
      keepFileIds: editingLostItem.attachments.map((attachment) => attachment.fileId),
    });

    if (input.status !== toAdminLostStatus(editingLostItem.publicStatus)) {
      await updateStoredItemStatus(storedItemId, toStoredItemStatus(input.status));
    }

    setLostItems((items) => items.map((item) => item.id === storedItemId
      ? {
          ...item,
          title: input.title.trim(),
          category: input.categoryName,
          location: [input.locationName, input.detailLocation.trim()]
            .filter(Boolean)
            .join(" "),
          storageLocation: input.storageLocation,
          foundDate: input.foundDate.replace(/-/g, "."),
          status: input.status,
        }
      : item));
    setEditingLostItem(null);
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
        setFacilityDetailError(getUserErrorMessage(
          error,
          "문의 상세 정보를 불러오지 못했습니다.",
        ));
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

      setLogoutError(getUserErrorMessage(error, "로그아웃에 실패했습니다."));
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        section={section}
        account={account}
        onNavigate={changeSection}
        onLogout={() => {
          setLogoutError("");
          setShowLogoutModal(true);
        }}
      />

      <main className="admin-main">
        <AdminHeader section={section} serverHealth={serverHealth} />

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
              <LostTable
                items={filteredLostItems}
                onStatusChange={updateLostStatus}
                onEdit={openLostEdit}
              />
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
                foundLocationText: input.detailLocation.trim() || undefined,
                itemName: input.title,
                description: input.detail.trim() || input.title,
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
              foundDate: input.foundDate.replace(/-/g, "."),
              status: input.status,
            }, ...items]);
            setShowLostForm(false);
          }}
        />
      )}
      {editingLostItem && (
        <LostEditModal
          item={editingLostItem}
          onClose={() => setEditingLostItem(null)}
          onSubmit={saveLostEdit}
          onDelete={async () => {
            const storedItemId = editingLostItem.storedItemId;
            await deleteStoredItem(storedItemId);
            setLostItems((items) => items.filter(
              (item) => item.id !== storedItemId,
            ));
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
          onDelete={async () => {
            const facilityRequestId = selectedFacility.id;
            await deleteAdminFacilityRequest(facilityRequestId);
            setFacilityItems((items) => items.filter(
              (item) => item.id !== facilityRequestId,
            ));
            setFacilityTotalElements((total) => Math.max(0, total - 1));
          }}
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
        <LogoutConfirmModal
          isLoggingOut={isLoggingOut}
          error={logoutError}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => void handleLogout()}
        />
      )}
    </div>
  );
};

export default AdminApp;
