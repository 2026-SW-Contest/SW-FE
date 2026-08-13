import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login/Login";

import LostPage from "../pages/Lost/LostPage";
import LostDetail from "../pages/Lost/LostDetail";

import FacilityPage from "../pages/Facility/FacilityPage";
import FacilityDetail from "../pages/Facility/FacilityDetail";
import FacilityWrite from "../pages/Facility/FacilityWrite";
import FacilityComplete from "../pages/Facility/FacilityComplete";

import SearchPage from "../pages/Search/SearchPage";
import SearchResultPage from "../pages/Search/SearchResultPage";
import Signup from "../pages/Signup/Signup";
import MyPage from "../pages/MyPage/MyPage";
import RecoveryHistoryPage from "../pages/MyPage/RecoveryHistoryPage";
import RepairHistoryPage from "../pages/MyPage/RepairHistoryPage";
import EditProfilePage from "../pages/MyPage/EditProfilePage";
import ChangePasswordPage from "../pages/MyPage/ChangePasswordPage";
import NotificationPage from "../pages/Notification/NotificationPage";
import StudentRoute from "./StudentRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* 회원 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/notifications"
        element={<StudentRoute><NotificationPage /></StudentRoute>}
      />
      <Route path="/mypage" element={<StudentRoute><MyPage /></StudentRoute>} />
      <Route
        path="/mypage/recovery-history"
        element={<StudentRoute><RecoveryHistoryPage /></StudentRoute>}
      />
      <Route
        path="/mypage/repair-history"
        element={<StudentRoute><RepairHistoryPage /></StudentRoute>}
      />
      <Route
        path="/mypage/edit"
        element={<StudentRoute><EditProfilePage /></StudentRoute>}
      />
      <Route
        path="/mypage/edit/password"
        element={<StudentRoute><ChangePasswordPage /></StudentRoute>}
      />

      {/* 분실물 */}
      <Route path="/lost" element={<LostPage />} />
      <Route path="/lost/:id" element={<LostDetail />} />

      {/* 시설·기자재 */}
      <Route path="/facility" element={<FacilityPage />} />
      <Route path="/facility/:id" element={<FacilityDetail />} />
      <Route
        path="/facility/:id/edit"
        element={<StudentRoute><FacilityWrite /></StudentRoute>}
      />
      <Route
        path="/facility/write"
        element={(
          <StudentRoute loginNotice="로그인이 필요한 서비스입니다.">
            <FacilityWrite />
          </StudentRoute>
        )}
      />
      <Route path="/facility/complete" element={<FacilityComplete />} />

      {/* 검색 */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/search/result" element={<SearchResultPage />} />
    </Routes>
  );
};

export default AppRouter;
