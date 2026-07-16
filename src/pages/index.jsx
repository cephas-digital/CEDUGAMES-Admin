import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  let navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);
  return <></>;
};

export default Index;
