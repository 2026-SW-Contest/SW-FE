import { AdminFacilityItem, AdminLostItem, AdminStatus, OwnerRequest } from "../../types";
import { EmptyRow, StatusBadge } from "../common/AdminPrimitives";

export const LostTable = ({ items, onStatusChange, onEdit }: {
  items: AdminLostItem[];
  onStatusChange: (id: number, status: AdminStatus) => void;
  onEdit: (id: number) => void;
}) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>분실물 목록</h2><span>총 {items.length}건</span></div>
    <table><thead><tr><th>번호</th><th>게시글 제목</th><th>카테고리</th><th>습득 장소</th><th>보관 장소</th><th>습득 일자</th><th>처리 상태</th><th>관리</th></tr></thead>
      <tbody>{items.length === 0 ? <EmptyRow colSpan={8} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.title}</td><td>{item.category}</td><td>{item.location}</td><td>{item.storageLocation}</td><td>{item.foundDate}</td><td>
          <select className={`admin-status-select ${item.status}`} value={item.status} onChange={(event) => onStatusChange(item.id, event.target.value as AdminStatus)}>
            <option value="waiting">보관중</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option>
          </select>
        </td><td><button type="button" className="admin-table-action" onClick={() => onEdit(item.id)}>수정</button></td></tr>
      ))}</tbody>
    </table>
  </section>
);

export const RequestTable = ({ items, onSelect }: { items: OwnerRequest[]; onSelect: (item: OwnerRequest) => void }) => (
  <section className="admin-table-card">
    <div className="admin-table-title"><h2>소유자 확인 요청 목록</h2><span>총 {items.length}건</span></div>
    <table><thead><tr><th>요청 번호</th><th>대상 분실물</th><th>신청자</th><th>학번</th><th>신청 일시</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>{items.length === 0 ? <EmptyRow colSpan={7} /> : items.map((item) => (
        <tr key={item.id}><td>#{item.id}</td><td className="admin-table-strong">{item.itemTitle}</td><td>{item.applicant}</td><td>{item.studentNumber}</td><td>{item.submittedAt}</td><td><StatusBadge status={item.status} /></td><td><button type="button" className="admin-table-action" onClick={() => onSelect(item)}>검토하기</button></td></tr>
      ))}</tbody>
    </table>
  </section>
);

export const FacilityTable = ({ items, totalElements, isLoading, error, onSelect }: {
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
