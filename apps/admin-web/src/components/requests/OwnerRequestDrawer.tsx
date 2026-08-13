import { useEffect, useRef, useState } from "react";
import { getUserErrorMessage } from "../../../../../src/utils/userErrorMessage";
import { OwnerRequest } from "../../types";

export const OwnerRequestDrawer = ({ request, onClose, onProcess }: { request: OwnerRequest; onClose: () => void; onProcess: (request: OwnerRequest, result: "approved" | "rejected", message: string) => Promise<void> }) => {
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
      setProcessError(getUserErrorMessage(error, "요청 처리에 실패했습니다."));
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

