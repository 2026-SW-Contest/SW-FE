import "./BottomNavigation.css";

import { useNavigate } from "react-router-dom";

import homeIcon from "../../assets/icons/navigation/home.svg";
import homeActiveIcon from "../../assets/icons/navigation/home-active.svg";

import searchIcon from "../../assets/icons/navigation/search.svg";
import searchActiveIcon from "../../assets/icons/navigation/search-active.svg";

import lostItemsIcon from "../../assets/icons/navigation/lost-items.svg";
import lostItemsActiveIcon from "../../assets/icons/navigation/lost-items-active.svg";

import facilitiesIcon from "../../assets/icons/navigation/facilities.svg";
import facilitiesActiveIcon from "../../assets/icons/navigation/facilities-active.svg";

import myPageIcon from "../../assets/icons/navigation/my-page.svg";
import myPageActiveIcon from "../../assets/icons/navigation/my-page-active.svg";

interface BottomNavigationProps {
  current: "home" | "search" | "lost" | "repair" | "mypage";
}

const BottomNavigation = ({
  current,
}: BottomNavigationProps) => {
  const navigate = useNavigate();

  const isLogin =
    localStorage.getItem("isLogin") === "true";

  return (
    <nav className="bottom-nav">

      {/* 홈 */}
      <div
        className={`nav-item ${current === "home" ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        <img
          src={current === "home" ? homeActiveIcon : homeIcon}
          alt="홈"
        />
        <span
          className={
            current === "home"
              ? "caption01"
              : "caption02"
          }
        >
          홈
        </span>
      </div>

      {/* 검색 */}
      <div
        className={`nav-item ${current === "search" ? "active" : ""}`}
        onClick={() => navigate("/search")}
      >
        <img
          src={current === "search" ? searchActiveIcon : searchIcon}
          alt="검색"
        />
        <span
          className={
            current === "search"
              ? "caption01"
              : "caption02"
          }
        >
          검색
        </span>
      </div>

      {/* 분실물 */}
      <div
        className={`nav-item ${current === "lost" ? "active" : ""}`}
        onClick={() => navigate("/lost")}
      >
        <img
          src={current === "lost" ? lostItemsActiveIcon : lostItemsIcon}
          alt="분실물"
        />
        <span
          className={
            current === "lost"
              ? "caption01"
              : "caption02"
          }
        >
          분실물
        </span>
      </div>

      {/* 시설·기자재 */}
      <div
        className={`nav-item ${current === "repair" ? "active" : ""}`}
        onClick={() => navigate("/facility")}
      >
        <img
          src={
            current === "repair"
              ? facilitiesActiveIcon
              : facilitiesIcon
          }
          alt="시설·기자재"
        />
        <span
          className={
            current === "repair"
              ? "caption01"
              : "caption02"
          }
        >
          시설·기자재
        </span>
      </div>

      {/* 마이 */}
      <div
        className={`nav-item ${current === "mypage" ? "active" : ""}`}
        onClick={() =>
          navigate(
            isLogin
              ? "/mypage"
              : "/login"
          )
        }
      >
        <img
          src={
            current === "mypage"
              ? myPageActiveIcon
              : myPageIcon
          }
          alt="마이"
        />
        <span
          className={
            current === "mypage"
              ? "caption01"
              : "caption02"
          }
        >
          마이
        </span>
      </div>

    </nav>
  );
};

export default BottomNavigation;
