import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import LostPage from "../pages/Lost/LostPage";
import LostDetail from "../pages/Lost/LostDetail";
import SearchPage from "../pages/Search/SearchPage";
import SearchResultPage from "../pages/Search/SearchResultPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lost" element={<LostPage />} />
      <Route path="/lost/:id" element={<LostDetail />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/search/result" element={<SearchResultPage />} />
    </Routes>
  );
};

export default AppRouter;