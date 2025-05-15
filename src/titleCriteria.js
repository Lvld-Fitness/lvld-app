export const TITLE_ACHIEVEMENTS = [
  {
    title: 'Beta Tester',
    description: 'Users who used LVLD During Beta! You are the Real MVP! <3'
  },
  {
    title: 'LVLD Developer',
    description: 'For the person who developed LVLD!'
  },
  { 
    //Workout Achievements
    title: 'Rookie', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 1,
    description: 'Complete your first workout to become a Rookie.'
  },
  { 
    title: 'Contender', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 10,
    description: 'Complete 10 workouts to earn the Contender title.'
  },
  { 
    title: 'Iron Addict', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 25,
    description: 'Crush 25 workouts to become an Iron Addict.'
  },
  { 
    title: 'Rep Lord', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 50,
    description: 'Complete 50 workouts and reign as the Rep Lord.'
  },
  { 
    title: 'Centurion', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 100,
    description: 'Hit 100 workouts and earn the Centurion title.'
  },
  { 
    title: 'Five-Hundo', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 500,
    description: 'Grind through 500 workouts to hit the Five-Hundo mark.'
  },
  { 
    title: 'Thousand Club', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 1000,
    description: 'Achieve a whopping 1,000 workouts and join the Thousand Club.'
  },
  { 
    title: 'LVLD Legend', 
    condition: (data) => (data.workoutHistory?.length || 0) >= 1500,
    description: 'Become a true LVLD Legend by completing 1,500 workouts.'
  },
  //Distance Achievements
  { 
    title: 'Mile Starter', 
    condition: (data) => (data.totalDistance || 0) >= 10,
    description: 'Travel 10 miles to earn the Mile Starter title.'
  },
  { 
    title: 'Trailblazer', 
    condition: (data) => (data.totalDistance || 0) >= 25,
    description: 'Rack up 25 miles to become a Trailblazer.'
  },
  { 
    title: 'Road Warrior', 
    condition: (data) => (data.totalDistance || 0) >= 50,
    description: 'Conquer 50 miles and claim the Road Warrior title.'
  },
  { 
    title: 'Mile Slayer', 
    condition: (data) => (data.totalDistance || 0) >= 100,
    description: 'Hit 100 miles to become a Mile Slayer.'
  },
  { 
    title: 'LVLD Marathoner', 
    condition: (data) => (data.totalDistance || 0) >= 200,
    description: 'Run, walk, or cycle a total of 200 miles to become an LVLD Marathoner.'
  },
  { 
    title: 'Map Melter', 
    condition: (data) => (data.totalDistance || 0) >= 500,
    description: 'Melt the map by covering 500 miles in total distance.'
  },
  // Total Weight Lifted Achievements
  { 
    title: 'Weight Beginner', 
    condition: (data) => (data.totalWeight || 0) >= 1000,
    description: 'Lift a total of 1,000 lbs to become a Weight Beginner.'
  },
  { 
    title: 'Iron Mover', 
    condition: (data) => (data.totalWeight || 0) >= 5000,
    description: 'Move 5,000 lbs of iron and earn the Iron Mover title.'
  },
  { 
    title: 'Weight Slayer', 
    condition: (data) => (data.totalWeight || 0) >= 10000,
    description: 'Crush 10,000 lbs to claim the Weight Slayer title.'
  },
  { 
    title: 'Plate Pusher', 
    condition: (data) => (data.totalWeight || 0) >= 25000,
    description: 'Push a total of 25,000 lbs to become a Plate Pusher.'
  },
  { 
    title: 'Heavy Hitter', 
    condition: (data) => (data.totalWeight || 0) >= 50000,
    description: 'Smash through 50,000 lbs to earn the Heavy Hitter title.'
  },
  { 
    title: 'Ton Lifter', 
    condition: (data) => (data.totalWeight || 0) >= 100000,
    description: 'Lift a total of 100,000 lbs to achieve the Ton Lifter title.'
  },
  { 
    title: 'LVLD Powerhouse', 
    condition: (data) => (data.totalWeight || 0) >= 250000,
    description: 'Push yourself to 250,000 lbs to become an LVLD Powerhouse.'
  },
  { 
    title: 'Steel Titan', 
    condition: (data) => (data.totalWeight || 0) >= 500000,
    description: 'Move a monumental 500,000 lbs and claim the Steel Titan title.'
  },
  { 
    title: 'Weight King', 
    condition: (data) => (data.totalWeight || 0) >= 1000000,
    description: 'Lift a staggering 1,000,000 lbs to become the Weight King.'
  },
    // Single Workout Weight Lifted Achievements
    { 
      title: 'Lightweight', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 500,
      description: 'Lift 500 lbs in a single workout to earn the Lightweight title.'
    },
    { 
      title: 'Middleweight', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 1000,
      description: 'Push through 1,000 lbs in a single workout to become a Middleweight.'
    },
    { 
      title: 'Heavyweight', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 2500,
      description: 'Crush 2,500 lbs in a single workout to achieve Heavyweight status.'
    },
    { 
      title: 'Super Heavyweight', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 5000,
      description: 'Lift 5,000 lbs in one workout to earn the Super Heavyweight title.'
    },
    { 
      title: 'Beast Mode', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 10000,
      description: 'Dominate with 10,000 lbs in a single workout and activate Beast Mode.'
    },
    { 
      title: 'Absolute Unit', 
      condition: (data) => (data.singleWorkoutWeight || 0) >= 20000,
      description: 'Become an Absolute Unit by lifting a monstrous 20,000 lbs in one session.'
    },
];


