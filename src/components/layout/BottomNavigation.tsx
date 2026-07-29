import "./BottomNavigation.css";

import homeIcon from "../../assets/icons/home.svg";
import searchIcon from "../../assets/icons/search.svg";
import lostIcon from "../../assets/icons/lost.svg";
import repairIcon from "../../assets/icons/repair.svg";
import mypageIcon from "../../assets/icons/mypage.svg";

const BottomNavigation = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-item">
        <img src={homeIcon} alt="홈" />
        <span>홈</span>
      </div>

      <div className="nav-item">
        <img src={searchIcon} alt="검색" />
        <span>검색</span>
      </div>

      <div className="nav-item">
        <img src={lostIcon} alt="분실물" />
        <span>분실물</span>
      </div>

      <div className="nav-item">
        <img src={repairIcon} alt="시설·기자재" />
        <span>시설·기자재</span>
      </div>

      <div className="nav-item">
        <img src={mypageIcon} alt="마이" />
        <span>마이</span>
      </div>
    </nav>
  );
};

export default BottomNavigation;