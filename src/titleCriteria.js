export const TITLE_ACHIEVEMENTS = [
    //Workouts Completed Achievements
    { title: 'Rookie', condition: (data) => (data.workoutHistory?.length || 0) >= 1 },
    { title: 'Contender', condition: (data) => (data.workoutHistory?.length || 0) >= 10 },
    { title: 'Iron Addict', condition: (data) => (data.workoutHistory?.length || 0) >= 25 },
    { title: 'Rep Lord', condition: (data) => (data.workoutHistory?.length || 0) >= 50 },
    { title: 'Centurion', condition: (data) => (data.workoutHistory?.length || 0) >= 100 },
    { title: 'Five-Hundo', condition: (data) => (data.workoutHistory?.length || 0) >= 500 },
    { title: 'Thousand Club', condition: (data) => (data.workoutHistory?.length || 0) >= 1000 },
    { title: 'LVLD Legend', condition: (data) => (data.workoutHistory?.length || 0) >= 1500 },
    
  //Distance Achievments
  { title: 'Mile Starter', condition: (data) => (data.totalDistance || 0) >= 10 },
  { title: 'Trailblazer', condition: (data) => (data.totalDistance || 0) >= 25 },
  { title: 'Road Warrior', condition: (data) => (data.totalDistance || 0) >= 50 },
  { title: 'Mile Slayer', condition: (data) => (data.totalDistance || 0) >= 100 },
  { title: 'LVLD Marathoner', condition: (data) => (data.totalDistance || 0) >= 200 },
  { title: 'Map Melter', condition: (data) => (data.totalDistance || 0) >= 500 },
  ];
  