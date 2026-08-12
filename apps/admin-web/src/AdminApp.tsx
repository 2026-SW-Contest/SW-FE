import { FormEvent, useMemo, useState } from "react";

import logo from "../../../src/assets/icons/brand/logo-horizontal.svg";
import {
  initialFacilityItems,
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
];

const pageTitle: Record<AdminSection, [string, string]> = {
  dashboard: ["대시보드", "오늘 처리해야 할 커넥띵 운영 현황입니다."],
  lost: ["분실물 관리", "접수된 분실물을 등록하고 반환 상태를 관리합니다."],
  requests: ["소유자 확인 요청", "학생이 제출한 증빙자료를 확인하고 결과를 전달합니다."],
  facility: ["시설·기자재 문의", "접수된 문의의 진행 상태와 관리자 답변을 관리합니다."],
};

const StatusBadge = ({ status }: { status: AdminStatus }) => (
  <span className={`admin-status admin-status-${status}`}>
    {statusLabel[status]}
  </span>
);

const EmptyRow = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td className="admin-empty-row" colSpan={colSpan}>표시할 항목이 없습니다.</td>
  </tr>
);

const AdminApp = () => {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [lostItems, setLostItems] = useState(initialLostItems);
  const [ownerRequests, setOwnerRequests] = useState(initialOwnerRequests);
  const [facilityItems, setFacilityItems] = useState(initialFacilityItems);
  const [showLostForm, setShowLostForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<AdminFacilityItem | null>(null);

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
  const filteredFacilityItems = useMemo(
    () => filterBySearchAndStatus(facilityItems),
    [facilityItems, query, statusFilter],
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
    setLostItems((items) =>
      items.map((item) => item.id === id ? { ...item, status } : item),
    );
  };

  const processOwnerRequest = (
    request: OwnerRequest,
    result: "approved" | "rejected",
    message: string,
  ) => {
    const nextStatus: AdminStatus = result === "approved" ? "resolved" : "inProgress";

    setOwnerRequests((requests) => requests.map((item) =>
      item.id === request.id
        ? { ...item, status: nextStatus, result, resultMessage: message }
        : item,
    ));
    updateLostStatus(request.lostItemId, nextStatus);
    setSelectedRequest(null);
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
          <span><strong>관리자</strong><small>시설관리팀</small></span>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{pageTitle[section][0]}</h1>
            <p>{pageTitle[section][1]}</p>
          </div>
          <span className="admin-date">2026.08.12</span>
        </header>

        {section === "dashboard" ? (
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
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as AdminStatus | "all")
                  }
                >
                  <option value="all">전체 상태</option>
                  <option value="waiting">대기</option>
                  <option value="inProgress">진행중</option>
                  <option value="resolved">해결완료</option>
                </select>
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
              <RequestTable items={filteredRequests} onSelect={setSelectedRequest} />
            )}
            {section === "facility" && (
              <FacilityTable items={filteredFacilityItems} onSelect={setSelectedFacility} />
            )}
          </>
        )}
      </main>

      {showLostForm && (
        <LostRegistrationModal
          onClose={() => setShowLostForm(false)}
          onSubmit={(item) => {
            setLostItems((items) => [item, ...items]);
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
          onClose={() => setSelectedFacility(null)}
          onSave={(status, answer) => {
            setFacilityItems((items) => items.map((item) =>
              item.id === selectedFacility.id ? { ...item, status, answer } : item,
            ));
            setSelectedFacility(null);
          }}
        />
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
    { label: "보관 대기 분실물", value: lostItems.filter((item) => item.status === "waiting").length, section: "lost" as const },
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
            <option value="waiting">대기</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option>
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

const FacilityTable = ({ items, onSelect }: { items: AdminFacilityItem[]; onSelect: (item: AdminFacilityItem) => void }) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>시설·기자재 문의 목록</h2><span>총 {items.length}건</span></div>
    <table><thead><tr><th>번호</th><th>문의 제목</th><th>카테고리</th><th>장소</th><th>등록일</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>{items.length === 0 ? <EmptyRow colSpan={7} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.title}</td><td>{item.category}</td><td>{item.location}</td><td>{item.submittedAt}</td><td><StatusBadge status={item.status} /></td><td><button type="button" className="admin-table-action" onClick={() => onSelect(item)}>관리하기</button></td></tr>
      ))}</tbody>
    </table>
  </section>
);

const LostRegistrationModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (item: AdminLostItem) => void }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      id: Date.now(),
      title: String(data.get("title")),
      category: String(data.get("category")),
      location: `${data.get("location")} ${data.get("detailLocation")}`.trim(),
      storageLocation: String(data.get("storageLocation")),
      foundDate: String(data.get("foundDate")).replaceAll("-", "."),
      status: data.get("status") as AdminStatus,
    });
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form className="admin-modal" onSubmit={handleSubmit}>
        <div className="admin-modal-header"><div><h2>분실물 게시글 등록</h2><p>필수 정보를 입력해 학생 서비스에 게시합니다.</p></div><button type="button" onClick={onClose}>×</button></div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide"><span>대표 사진 *</span><input type="file" accept="image/*" required /></label>
          <label className="admin-field admin-field-wide"><span>게시글 제목 *</span><input name="title" required placeholder="분실물의 특징이 드러나는 제목" /></label>
          <label className="admin-field"><span>처리 상태 *</span><select name="status" required><option value="waiting">대기</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option></select></label>
          <label className="admin-field"><span>습득 일자 *</span><input name="foundDate" type="date" required /></label>
          <label className="admin-field"><span>습득 장소 *</span><select name="location" required>{["S1 본관(종합관)","S2 학생회관","S3 미래관","S4 경상관(국제관)","S5 행정동","S6 운동장","S7 주차장","S8 기숙사","S9 방목학술정보관(도서관)","S10 MCC관","기타"].map((location) => <option key={location}>{location}</option>)}</select></label>
          <label className="admin-field"><span>상세 위치</span><input name="detailLocation" placeholder="예: 1층 로비" /></label>
          <label className="admin-field"><span>카테고리 *</span><select name="category" required>{["전자기기","지갑 / 카드 / 현금","가방 / 파우치","의류 / 패션잡화","액세서리","도서 / 문구","학생증","열쇠","우산","기타"].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="admin-field"><span>보관 장소 *</span><select name="storageLocation" required>{["S1 본관(종합관) 1층 경비실","S2 학생회관 1층 경비실","S3 미래관 1층 경비실","S4 경상관(국제관) 1층 경비실","S5 행정동 1층 경비실","S6 운동장 관리실","S7 주차장 관리실","S8 기숙사 관리실","S9 방목학술정보관 안내데스크","S10 MCC관 1층 경비실","기타"].map((location) => <option key={location}>{location}</option>)}</select></label>
          <label className="admin-field admin-field-wide"><span>물건 상세 정보</span><textarea name="detail" rows={4} placeholder="물건의 색상, 특징, 구성품 등을 입력하세요." /></label>
        </div>
        <div className="admin-modal-actions"><button type="button" onClick={onClose}>취소</button><button type="submit" className="admin-primary-button">등록하기</button></div>
      </form>
    </div>
  );
};

const OwnerRequestDrawer = ({ request, onClose, onProcess }: { request: OwnerRequest; onClose: () => void; onProcess: (request: OwnerRequest, result: "approved" | "rejected", message: string) => void }) => {
  const [result, setResult] = useState<"approved" | "rejected">("approved");
  const [message, setMessage] = useState("");
  return (
    <div className="admin-drawer-backdrop">
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-label="소유자 확인 요청 처리">
        <div className="admin-modal-header"><div><h2>소유자 확인 요청 처리</h2><p>요청 #{request.id}</p></div><button type="button" onClick={onClose}>×</button></div>
        <section className="admin-detail-box"><h3>{request.itemTitle}</h3><dl><div><dt>신청자</dt><dd>{request.applicant}</dd></div><div><dt>학번</dt><dd>{request.studentNumber}</dd></div><div><dt>신청 일시</dt><dd>{request.submittedAt}</dd></div></dl></section>
        <section className="admin-detail-section"><h3>제출한 증빙 내용</h3><p>{request.evidence}</p></section>
        <section className="admin-detail-section"><h3>처리 결과</h3><div className="admin-segmented"><button type="button" className={result === "approved" ? "active" : ""} onClick={() => setResult("approved")}>승인</button><button type="button" className={result === "rejected" ? "active danger" : ""} onClick={() => setResult("rejected")}>반려</button></div></section>
        {result === "approved" ? (
          <><label className="admin-field"><span>방문 장소 *</span><select><option>S1 본관(종합관) 1층 경비실</option><option>S9 방목학술정보관 안내데스크</option><option>S10 MCC관 1층 경비실</option></select></label><div className="admin-notice-preview"><strong>신청자 자동 알림</strong><p>본인 확인이 완료되었습니다. 해당 물건의 증빙자료를 지참하여 방문해주세요.</p><small>운영시간 09:00 ~ 17:00</small></div></>
        ) : (
          <label className="admin-field"><span>반려 사유 *</span><textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="신청자에게 전달할 반려 사유를 입력하세요." /></label>
        )}
        <div className="admin-drawer-actions"><button type="button" onClick={onClose}>취소</button><button type="button" className="admin-primary-button" disabled={result === "rejected" && !message.trim()} onClick={() => onProcess(request, result, message)}>처리 완료</button></div>
      </aside>
    </div>
  );
};

const FacilityDrawer = ({ item, onClose, onSave }: { item: AdminFacilityItem; onClose: () => void; onSave: (status: AdminStatus, answer: string) => void }) => {
  const [status, setStatus] = useState(item.status);
  const [answer, setAnswer] = useState(item.answer ?? "");
  return (
    <div className="admin-drawer-backdrop"><aside className="admin-drawer" role="dialog" aria-modal="true" aria-label="시설 문의 처리">
      <div className="admin-modal-header"><div><h2>시설·기자재 문의 처리</h2><p>문의 #{item.id}</p></div><button type="button" onClick={onClose}>×</button></div>
      <section className="admin-detail-box"><h3>{item.title}</h3><dl><div><dt>카테고리</dt><dd>{item.category}</dd></div><div><dt>장소</dt><dd>{item.location}</dd></div><div><dt>등록일</dt><dd>{item.submittedAt}</dd></div></dl></section>
      <section className="admin-detail-section"><h3>문의 내용</h3><p>{item.description}</p></section>
      <label className="admin-field"><span>처리 상태 *</span><select value={status} onChange={(event) => setStatus(event.target.value as AdminStatus)}><option value="waiting">대기</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option></select></label>
      <label className="admin-field"><span>관리자 답변</span><textarea rows={7} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="학생에게 전달할 처리 내용을 입력하세요." /></label>
      <div className="admin-drawer-actions"><button type="button" onClick={onClose}>취소</button><button type="button" className="admin-primary-button" onClick={() => onSave(status, answer)}>저장하기</button></div>
    </aside></div>
  );
};

export default AdminApp;
