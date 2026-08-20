import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/common/SharedLayout.css";

export default function SharedLayout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content-wrapper">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}