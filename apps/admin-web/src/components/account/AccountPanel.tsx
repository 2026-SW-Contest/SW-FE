import { AdminAccount } from "../../types";

export const AccountPanel = ({
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
