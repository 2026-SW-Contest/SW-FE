import logo from "../../../../../src/assets/icons/brand/logo-horizontal.svg";
import { navItems } from "../../config/adminConfig";
import type { AdminAccount, AdminSection } from "../../types";

interface AdminSidebarProps {
  section: AdminSection;
  account: AdminAccount | null;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
}

export const AdminSidebar = ({
  section,
  account,
  onNavigate,
  onLogout,
}: AdminSidebarProps) => (
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
          onClick={() => onNavigate(item.key)}
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
      <button type="button" className="admin-logout-button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  </aside>
);
