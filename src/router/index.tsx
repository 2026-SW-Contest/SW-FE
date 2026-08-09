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

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* 분실물 */}
      <Route path="/lost" element={<LostPage />} />
      <Route path="/lost/:id" element={<LostDetail />} />

      {/* 시설·기자재 */}
      <Route path="/facility" element={<FacilityPage />} />
      <Route path="/facility/:id" element={<FacilityDetail />} />
      <Route path="/facility/write" element={<FacilityWrite />} />
      <Route path="/facility/complete" element={<FacilityComplete />} />

      {/* 검색 */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/search/result" element={<SearchResultPage />} />
    </Routes>
  );
};

export default AppRouter;