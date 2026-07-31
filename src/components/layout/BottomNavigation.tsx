import "./BottomNavigation.css";

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

const BottomNavigation = ({ current }: BottomNavigationProps) => {
  return (
    <nav className="bottom-nav">

      <div className={`nav-item ${current === "home" ? "active" : ""}`}>
        <img src={current === "home" ? homeSelected : homeDefault} alt="홈" />
        <span className={current === "home" ? "caption01" : "caption02"}>
          홈
        </span>
      </div>

      <div className={`nav-item ${current === "search" ? "active" : ""}`}>
        <img src={current === "search" ? searchSelected : searchDefault} alt="검색" />
        <span className={current === "search" ? "caption01" : "caption02"}>
          검색
        </span>
      </div>

      <div className={`nav-item ${current === "lost" ? "active" : ""}`}>
        <img src={current === "lost" ? lostSelected : lostDefault} alt="분실물" />
        <span className={current === "lost" ? "caption01" : "caption02"}>
          분실물
        </span>
      </div>

      <div className={`nav-item ${current === "repair" ? "active" : ""}`}>
        <img src={current === "repair" ? repairSelected : repairDefault} alt="시설·기자재" />
        <span className={current === "repair" ? "caption01" : "caption02"}>
          시설·기자재
        </span>
      </div>

      <div className={`nav-item ${current === "mypage" ? "active" : ""}`}>
        <img src={current === "mypage" ? mypageSelected : mypageDefault} alt="마이" />
        <span className={current === "mypage" ? "caption01" : "caption02"}>
          마이
        </span>
      </div>

    </nav>
  );
};

export default BottomNavigation;
