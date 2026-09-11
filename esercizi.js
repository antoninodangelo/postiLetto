const campiForm = [
  { id: "IDZona", label: "Zona" },
  { id: "telefono", label: "Telefono" }
];

const storage = Object.fromEntries(
  campiForm.map(c => [c.id, ""])
);

console.log(Object.keys(storage));   // ["IDZona", "telefono"]
console.log(Object.values(storage)); // ["", ""]
console.log(Object.entries(storage)); 
// [["IDZona",""], ["telefono",""]]
