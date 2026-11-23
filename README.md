# Signal Snap

A Scratch-style web app where students snap together blocks to "code" a cell.

## Run it (Mac)

1. Open this folder in VS Code (File -> Open Folder).
2. Open a terminal in VS Code (Terminal -> New Terminal) and run:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

3. Open http://127.0.0.1:5000 in your browser.

Next time, you only need:

```bash
source venv/bin/activate
python3 app.py
```

In VS Code, press Cmd+Shift+P, choose "Python: Select Interpreter", and pick the one inside `venv`.

## Try Mission 1

Build this in the block workspace, then press Run:

```
when 🟢 clicked
  release adrenaline

when adrenaline reaches the cell
  receptor turns ON

when receptor is ON
  make messenger (cAMP) 10 times

when messenger (cAMP) is HIGH
  kinase turns ON

when kinase is ON
  cell does speed up heartbeat
```

Add `break receptor` under "when 🟢 clicked" and run again. The chain should stop at the receptor.

## Files

- `app.py`: Flask routes
- `simulate.py`: the rule engine
- `static/blocks.js`: custom Blockly blocks and the blocks-to-JSON compiler
- `static/stage.js`: canvas animation
- `static/main.js`: wires the Run button to everything
