const workspace = Blockly.inject("blocklyDiv", { toolbox, trashcan: true });
const stage = new Stage(document.getElementById("stage"));
const log = document.getElementById("log");

document.getElementById("run").onclick = async () => {
  const program = compile(workspace);
  log.textContent = JSON.stringify(program, null, 2);   // handy for debugging

  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(program),
  });
  const data = await res.json();
  stage.play(data.events);
};
