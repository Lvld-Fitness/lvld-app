import React from "react";

const RankIcon = ({ rank, size = 34 }) => {
  const iconPath = `/rank-icons/${rank}.png`;
  return (
    <img 
      src={iconPath} 
      alt={rank} 
      className={`object-cover`} 
      style={{ width: `${size}px`, height: `${size}px` }} 
      title={rank.replace("_", " ").toUpperCase()} 
    />
  );
};


export default RankIcon;






