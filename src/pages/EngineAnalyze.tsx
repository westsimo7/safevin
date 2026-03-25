import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EngineAnalyze = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/engine/analyze/audit", { replace: true });
  }, [navigate]);

  return null;
};

export default EngineAnalyze;
