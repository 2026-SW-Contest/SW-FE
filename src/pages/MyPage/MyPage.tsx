import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AlertModal from "../../components/common/AlertModal/AlertModal";
import Layout from "../../components/layout/Layout";
import NotificationBellButton from "../../components/common/NotificationBellButton/NotificationBellButton";

import { mockUser } from "../../mock/user";
import { useRecoveryRequests } from "../../context/RecoveryRequestContext";
import { useAuth } from "../../context/AuthContext";

import "./MyPage.css";

import profileIcon from "../../assets/icons/account/profile.svg";
import chevronRightIcon from "../../assets/icons/actions/chevron-right.svg";

const MyPage = () => {
  const navigate = useNavigate();
  const { recoveryItems } = useRecoveryRequests();
  const { user, logout, withdraw } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setIsLogoutModalOpen(false);
      navigate("/", { replace: true });
    }
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setWithdrawError("");

    try {
      await withdraw();
      setIsWithdrawModalOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      setWithdrawError(
        error instanceof Error
          ? error.message
          : "회원 탈퇴 처리에 실패했습니다.",
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Layout
      current="mypage"
      showAppBar={false}
    >
      <div className="mypage">
        {/* ---------- 프로필 ---------- */}

        <section className="mypage-profile">
          <div className="mypage-profile-left">
            <img
              src={profileIcon}
              alt="프로필"
              className="mypage-profile-icon"
            />

            <span className="body03 mypage-profile-name">
              {user?.name ?? mockUser.name}님
            </span>
          </div>

          <NotificationBellButton
            className="mypage-profile-bell"
          />
        </section>

        {/* ---------- 활동 ---------- */}

        <section className="mypage-section">
          <h2 className="body01 mypage-section-title">
            활동
          </h2>

          {/* 분실물 회수 내역 */}

          <div className="mypage-card">
            <button
              type="button"
              className="mypage-card-header"
              onClick={() =>
                navigate("/mypage/recovery-history")
              }
            >
              <span className="body05">
                분실물 회수 내역
              </span>

              <img
                src={chevronRightIcon}
                alt=""
              />
            </button>

            <div className="mypage-history-list">
              {recoveryItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="mypage-history-item"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="mypage-history-image"
                    />
                  ) : (
                    <div className="mypage-history-placeholder" />
                  )}
                </div>
              ))}
            </div>

          </div>
          {/* 수리·개선 문의 내역 */}
          <button
            type="button"
            className="mypage-setting"
            onClick={() =>
              navigate("/mypage/repair-history")
            }
          >
            <span className="body05">
              수리·개선 문의 내역
            </span>

            <img
              src={chevronRightIcon}
              alt=""
            />
          </button>

          </section>

        {/* ---------- 계정 설정 ---------- */}

        <section className="mypage-section">
          <h2 className="body01 mypage-section-title">
            계정 설정
          </h2>

          <button
            type="button"
            className="mypage-setting"
            onClick={() =>
              navigate("/mypage/edit")
            }
          >
            <span className="body05">
              회원 정보 수정
            </span>

            <img
              src={chevronRightIcon}
              alt=""
            />
          </button>

          <button
            type="button"
            className="mypage-setting"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <span className="body05">
              로그아웃
            </span>

            <img
              src={chevronRightIcon}
              alt=""
            />
          </button>

          <button
            type="button"
            className="mypage-setting"
            onClick={() => {
              setWithdrawError("");
              setIsWithdrawModalOpen(true);
            }}
          >
            <span className="body05">
              회원 탈퇴
            </span>

            <img
              src={chevronRightIcon}
              alt=""
            />
          </button>
        </section>

        <AlertModal
          open={isLogoutModalOpen}
          message="로그아웃 하시겠습니까?"
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={() => void handleLogout()}
        />

        <AlertModal
          open={isWithdrawModalOpen}
          message={
            withdrawError ||
            "회원 탈퇴 시 계정과 모든 로그인 세션이 종료됩니다.\n정말 탈퇴하시겠습니까?"
          }
          cancelLabel="취소"
          confirmLabel={isWithdrawing ? "처리 중" : "확인"}
          onCancel={() => {
            if (isWithdrawing) return;
            setIsWithdrawModalOpen(false);
            setWithdrawError("");
          }}
          onConfirm={() => void handleWithdraw()}
        />
      </div>
    </Layout>
  );
};

export default MyPage;
