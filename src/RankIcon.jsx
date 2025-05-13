import React from "react";

const RankIcon = ({ rank, size = 34 }) => {
  const safeRank = rank || "bronze_1";  // Fallback to "bronze_1" if rank is undefined
  const iconPath = `/rank-icons/${safeRank}.png`;
  return (
    <img 
      src={iconPath} 
      alt={safeRank} 
      className={`object-cover`} 
      style={{ width: `${size}px`, height: `${size}px` }} 
      title={safeRank.replace("_", " ").toUpperCase()} 
    />
  );
};


export default RankIcon;






