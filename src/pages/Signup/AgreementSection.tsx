interface AgreementState {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

interface AgreementSectionProps {
  agreements: AgreementState;

  isAllAgreed: boolean;

  onToggleAll: () => void;

  onToggle: (
    key: keyof AgreementState
  ) => void;
}

const AgreementSection = ({
  agreements,

  isAllAgreed,

  onToggleAll,

  onToggle,
}: AgreementSectionProps) => {
  return (
    <div className="signup-agreements">

      {/* 전체동의 */}

      <label className="signup-agreement signup-agreement-all">

        <input
          type="checkbox"
          checked={isAllAgreed}
          onChange={onToggleAll}
        />

        <span className="signup-checkbox" />

        <span className="body06">
          전체동의
        </span>

      </label>

      <div className="signup-agreement-divider" />

      {/* 이용약관 */}

      <label className="signup-agreement">

        <input
          type="checkbox"
          checked={agreements.terms}
          onChange={() =>
            onToggle("terms")
          }
        />

        <span className="signup-checkbox" />

        <span className="body06 signup-agreement-type">
          (필수)
        </span>

        <span className="body06">
          이용약관 동의
        </span>

      </label>

      {/* 개인정보 */}

      <label className="signup-agreement">

        <input
          type="checkbox"
          checked={agreements.privacy}
          onChange={() =>
            onToggle("privacy")
          }
        />

        <span className="signup-checkbox" />

        <span className="body06 signup-agreement-type">
          (필수)
        </span>

        <span className="body06">
          개인정보 수집 및 이용 동의
        </span>

      </label>

      {/* 마케팅 */}

      <label className="signup-agreement">

        <input
          type="checkbox"
          checked={agreements.marketing}
          onChange={() =>
            onToggle("marketing")
          }
        />

        <span className="signup-checkbox" />

        <span className="body06 signup-agreement-type">
          (선택)
        </span>

        <span className="body06">
          마케팅 활용 동의 및 광고 수신 동의
        </span>

      </label>

    </div>
  );
};

export default AgreementSection;