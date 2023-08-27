"use client";
import React, { useState, useEffect, useRef } from "react";
import Nav from "../nav"
import Siderbar from "./siderbar";
import { Content } from "./content"
import { checkIfLogin, getUserInfo } from "../security/auth";

export default function Hub() {
  const [userInfo, setUserInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  async function getInfo() {
    let identity = await getUserInfo();
    setUserInfo(identity.data);
  }
  useEffect(() => {
    checkIfLogin();
    getInfo();
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <main className="fixed flex flex-col bg-white w-screen">
      <Nav userInfo={userInfo} toggleSidebar={toggleSidebar} />
      <div className="flex flex-row">
        <Siderbar isOpen={isOpen} />
        <Content></Content>
      </div>

    </main>
  )
}