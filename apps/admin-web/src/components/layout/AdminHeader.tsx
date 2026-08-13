import type { ServerHealthStatus } from "../../../../../src/api/health";
import { pageTitle } from "../../config/adminConfig";
import type { AdminSection } from "../../types";

interface AdminHeaderProps {
  section: AdminSection;
  serverHealth: ServerHealthStatus | "CHECKING";
}

export const AdminHeader = ({ section, serverHealth }: AdminHeaderProps) => (
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
);
