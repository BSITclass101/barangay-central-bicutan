import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "75px" }}>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout; 