import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import LostPage from "../pages/Lost/LostPage";
import LostDetail from "../pages/Lost/LostDetail";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lost" element={<LostPage />} />
      <Route path="/lost/:id" element={<LostDetail />} />
    </Routes>
  );
};

export default AppRouter;