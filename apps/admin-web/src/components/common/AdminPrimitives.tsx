import waitingStatusIcon from "../../../../../src/assets/icons/status/waiting.svg";
import inProgressStatusIcon from "../../../../../src/assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../../../../../src/assets/icons/status/resolved.svg";
import { statusLabel } from "../../config/adminConfig";
import { AdminStatus } from "../../types";

export const StatusBadge = ({ status }: { status: AdminStatus }) => (
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

export const EmptyRow = ({
  colSpan,
  message = "표시할 항목이 없습니다.",
}: {
  colSpan: number;
  message?: string;
}) => (
  <tr>
    <td className="admin-empty-row" colSpan={colSpan}>
      {message}
    </td>
  </tr>
);

export const RequiredMark = () => <span className="admin-required">*</span>;
