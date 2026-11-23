const SIGNALS   = [["adrenaline", "adrenaline"]];
const PROTEINS  = [["receptor", "receptor"], ["kinase", "kinase"]];
const MOLECULES = [["messenger (cAMP)", "cAMP"]];
const ACTIONS   = [["speed up heartbeat", "heartbeat"], ["release sugar for energy", "sugar"]];

Blockly.common.defineBlocksWithJsonArray([
  { type: "when_flag", message0: "when 🟢 clicked", nextStatement: null, colour: 50 },
  { type: "release_signal", message0: "release %1",
    args0: [{ type: "field_dropdown", name: "SIGNAL", options: SIGNALS }],
    previousStatement: null, nextStatement: null, colour: 210 },
  { type: "break_protein", message0: "break %1",
    args0: [{ type: "field_dropdown", name: "PROTEIN", options: PROTEINS }],
    previousStatement: null, nextStatement: null, colour: 290 },
  { type: "when_signal", message0: "when %1 reaches the cell", message1: "%1",
    args0: [{ type: "field_dropdown", name: "SIGNAL", options: SIGNALS }],
    args1: [{ type: "input_statement", name: "DO" }], colour: 50 },
  { type: "protein_on", message0: "%1 turns ON",
    args0: [{ type: "field_dropdown", name: "PROTEIN", options: PROTEINS }],
    previousStatement: null, nextStatement: null, colour: 120 },
  { type: "when_protein_on", message0: "when %1 is ON", message1: "%1",
    args0: [{ type: "field_dropdown", name: "PROTEIN", options: PROTEINS }],
    args1: [{ type: "input_statement", name: "DO" }], colour: 50 },
  { type: "make_molecule", message0: "make %1 %2 times",
    args0: [{ type: "field_dropdown", name: "MOLECULE", options: MOLECULES },
            { type: "field_number", name: "COUNT", value: 10, min: 1, max: 50 }],
    previousStatement: null, nextStatement: null, colour: 30 },
  { type: "when_molecule_high", message0: "when %1 is HIGH", message1: "%1",
    args0: [{ type: "field_dropdown", name: "MOLECULE", options: MOLECULES }],
    args1: [{ type: "input_statement", name: "DO" }], colour: 50 },
  { type: "cell_does", message0: "cell does %1",
    args0: [{ type: "field_dropdown", name: "ACTION", options: ACTIONS }],
    previousStatement: null, nextStatement: null, colour: 0 },
]);

const toolbox = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "Events", colour: "50", contents: [
      { kind: "block", type: "when_flag" },
      { kind: "block", type: "when_signal" },
      { kind: "block", type: "when_protein_on" },
      { kind: "block", type: "when_molecule_high" } ] },
    { kind: "category", name: "Signals", colour: "210", contents: [
      { kind: "block", type: "release_signal" } ] },
    { kind: "category", name: "Proteins", colour: "120", contents: [
      { kind: "block", type: "protein_on" } ] },
    { kind: "category", name: "Actions", colour: "0", contents: [
      { kind: "block", type: "make_molecule" },
      { kind: "block", type: "cell_does" } ] },
    { kind: "category", name: "Experiments", colour: "290", contents: [
      { kind: "block", type: "break_protein" } ] },
  ],
};

// ---- Block tree -> rules JSON ----
function toAction(b) {
  switch (b.type) {
    case "release_signal": return { op: "release", name: b.getFieldValue("SIGNAL") };
    case "break_protein":  return { op: "break", name: b.getFieldValue("PROTEIN") };
    case "protein_on":     return { op: "protein_on", name: b.getFieldValue("PROTEIN") };
    case "make_molecule":  return { op: "make", name: b.getFieldValue("MOLECULE"),
                                    count: b.getFieldValue("COUNT") };
    case "cell_does":      return { op: "cell_does", name: b.getFieldValue("ACTION") };
  }
}

function chain(block) {            // walk a stack of blocks top to bottom
  const out = [];
  while (block) { out.push(toAction(block)); block = block.getNextBlock(); }
  return out;
}

function compile(workspace) {
  const program = { start: [], rules: [] };
  for (const top of workspace.getTopBlocks(true)) {
    const body = chain(top.getInputTargetBlock("DO"));
    switch (top.type) {
      case "when_flag":
        program.start.push(...chain(top.getNextBlock())); break;
      case "when_signal":
        program.rules.push({ when: { type: "signal", name: top.getFieldValue("SIGNAL") }, do: body }); break;
      case "when_protein_on":
        program.rules.push({ when: { type: "protein_on", name: top.getFieldValue("PROTEIN") }, do: body }); break;
      case "when_molecule_high":
        program.rules.push({ when: { type: "high", name: top.getFieldValue("MOLECULE") }, do: body }); break;
    }
  }
  return program;
}
