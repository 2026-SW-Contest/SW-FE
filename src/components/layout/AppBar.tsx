import "./AppBar.css";

import logo from "../../assets/icons/logo.svg";
import bell from "../../assets/icons/bell.svg";
import more from "../../assets/icons/more.svg";

const AppBar = () => {
  return (
    <header className="app-bar">
      <img src={logo} alt="logo" className="logo" />

      <div className="right-icons">
        <img src={bell} alt="bell" className="icon" />
      </div>
    </header>
  );
};

export default AppBar;