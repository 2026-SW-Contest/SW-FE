import "./BottomNavigation.css";

import { useNavigate } from "react-router-dom";

import homeDefault from "../../assets/icons/GNB/GNB-home(default).svg";
import homeSelected from "../../assets/icons/GNB/GNB-home(selected).svg";

import searchDefault from "../../assets/icons/GNB/GNB-search(default).svg";
import searchSelected from "../../assets/icons/GNB/GNB-search(selected).svg";

import lostDefault from "../../assets/icons/GNB/GNB-lost(default).svg";
import lostSelected from "../../assets/icons/GNB/GNB-lost(selected).svg";

import repairDefault from "../../assets/icons/GNB/GNB-repair(default).svg";
import repairSelected from "../../assets/icons/GNB/GNB-repair(selected).svg";

import mypageDefault from "../../assets/icons/GNB/GNB-mypage(default).svg";
import mypageSelected from "../../assets/icons/GNB/GNB-mypage(selected).svg";

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
          src={current === "home" ? homeSelected : homeDefault}
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
          src={current === "search" ? searchSelected : searchDefault}
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
          src={current === "lost" ? lostSelected : lostDefault}
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
              ? repairSelected
              : repairDefault
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
              ? mypageSelected
              : mypageDefault
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