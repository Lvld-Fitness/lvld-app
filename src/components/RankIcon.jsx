import React from "react";

const RankIcon = ({ rank }) => {
    const iconPath = `/rank-icons/${rank}.png`;
  
    return (
      <img 
        src={iconPath} 
        alt={rank} 
        className="w-6 h-6 object-cover" 
        title={rank.replace("_", " ").toUpperCase()} 
      />
    );
  };
  

export default RankIcon;
