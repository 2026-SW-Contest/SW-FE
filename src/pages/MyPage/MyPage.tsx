import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import { mockUser } from "../../mock/user";
import { recoveryHistory } from "../../mock/mypage";

import "./MyPage.css";

import profileIcon from "../../assets/icons/account/profile.svg";
import chevronRightIcon from "../../assets/icons/actions/chevron-right.svg";
import bellIcon from "../../assets/icons/notifications/bell.svg";

const MyPage = () => {
  const navigate = useNavigate();

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
              {mockUser.name}님
            </span>
          </div>

          <button
            type="button"
            className="mypage-profile-bell"
          >
            <img
              src={bellIcon}
              alt="알림"
            />
          </button>
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
              {recoveryHistory.slice(0, 3).map((item) => (
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
            onClick={() => {
              console.log("로그아웃");
            }}
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
              console.log("회원탈퇴");
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
      </div>
    </Layout>
  );
};

export default MyPage;
