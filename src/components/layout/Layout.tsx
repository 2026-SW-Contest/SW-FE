import { ReactNode } from "react";
import "./Layout.css";

import AppBar from "./AppBar";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app">
      <AppBar />

      <main className="content">
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Layout;