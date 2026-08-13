import { AdminFacilityItem, AdminLostItem, AdminSection, OwnerRequest } from "../../types";
import { StatusBadge } from "../common/AdminPrimitives";

export const Dashboard = ({
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

