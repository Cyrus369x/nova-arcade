// Nova Arcade — game catalog. Add your own games here!
// type "builtin" = bundled game (id maps to engine.js), type "embed" = external iframe URL.
const GAMES = [
  {id:'snake',     name:'Neon Snake',      cat:'Arcade', emoji:'🐍', type:'builtin', desc:'Classic snake with neon trails.'},
  {id:'2048',      name:'2048',             cat:'Puzzle', emoji:'🔢', type:'builtin', desc:'Slide and merge to 2048.'},
  {id:'breakout',  name:'Breakout X',       cat:'Arcade', emoji:'🧱', type:'builtin', desc:'Smash every brick.'},
  {id:'flappy',    name:'Flappy Cube',      cat:'Arcade', emoji:'🐦', type:'builtin', desc:'One tap flying.'},
  {id:'pong',      name:'Pong Deluxe',      cat:'Sports', emoji:'🏓', type:'builtin', desc:'You vs the machine.'},
  {id:'mines',     name:'Minesweeper',      cat:'Puzzle', emoji:'💣', type:'builtin', desc:'Clear the field.'},
  {id:'tetris',    name:'Blockfall',        cat:'Puzzle', emoji:'🟦', type:'builtin', desc:'Stack and clear lines.'},
  {id:'reaction',  name:'Reaction Test',    cat:'Skill',  emoji:'⚡', type:'builtin', desc:'How fast are you?'},
];
