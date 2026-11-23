const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const POS = { receptor: { x: 250, y: 150 }, kinase: { x: 250, y: 250 } };

class Stage {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.token = 0;
    this.reset();
    requestAnimationFrame((t) => this.loop(t));
  }

  reset() {
    this.dots = [];
    this.on = {};
    this.broken = {};
    this.bpm = 60;
    this.sugar = false;
    this.msg = "";
  }

  async play(events) {
    this.reset();
    const token = ++this.token;          // a newer Run cancels this one
    for (const e of events) {
      if (token !== this.token) return;
      this.handle(e);
      await sleep(e.type === "make" ? 1000 : 1200);
    }
  }

  handle(e) {
    const r = POS.receptor;
    switch (e.type) {
      case "break":
        this.broken[e.name] = true; this.msg = `${e.name} is broken!`; break;
      case "release":
        this.msg = `${e.name} released`;
        for (let i = 0; i < 5; i++)
          this.dots.push({ x: 100 + Math.random() * 300, y: 10, tx: r.x + Math.random() * 40 - 20,
                           ty: r.y - 30 - Math.random() * 15, color: "#e0a800", r: 6 });
        break;
      case "blocked":
        this.msg = `${e.name} can't turn on`; break;
      case "protein_on":
        this.on[e.name] = true; this.msg = `${e.name} turns ON`; break;
      case "make":
        this.msg = `making ${e.name} (x${e.count})`;
        for (let i = 0; i < e.count; i++)
          this.dots.push({ x: r.x, y: r.y + 20, tx: 40 + Math.random() * 420,
                           ty: 200 + Math.random() * 90, color: "#2a7fff", r: 4 });
        break;
      case "cell_action":
        if (e.name === "heartbeat") this.bpm = 150;
        if (e.name === "sugar") this.sugar = true;
        this.msg = `cell does: ${e.name}`; break;
    }
  }

  loop(t) {
    for (const d of this.dots) { d.x += (d.tx - d.x) * 0.05; d.y += (d.ty - d.y) * 0.05; }
    this.draw(t);
    requestAnimationFrame((t2) => this.loop(t2));
  }

  drawProtein(name, x, y, h) {
    const ctx = this.ctx;
    ctx.save();
    if (this.on[name]) { ctx.shadowColor = "#3c3"; ctx.shadowBlur = 20; }
    ctx.fillStyle = this.broken[name] ? "#888" : this.on[name] ? "#4c4" : "#9a6bd6";
    ctx.fillRect(x - 18, y - h / 2, 36, h);
    ctx.restore();
    ctx.fillStyle = "#000"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(name + (this.broken[name] ? " ✖" : ""), x + 24, y + 4);
  }

  draw(t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 500, 420);
    ctx.fillStyle = "#e8f4fd"; ctx.fillRect(0, 0, 500, 150);      // outside
    ctx.fillStyle = this.sugar ? "#fff3c4" : "#fdeef0"; ctx.fillRect(0, 150, 500, 270);  // inside
    ctx.fillStyle = "#c98a3a"; ctx.fillRect(0, 144, 500, 12);     // membrane

    this.drawProtein("receptor", POS.receptor.x, POS.receptor.y, 50);
    this.drawProtein("kinase", POS.kinase.x, POS.kinase.y, 30);

    for (const d of this.dots) {
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    }

    const scale = 1 + 0.15 * Math.sin((t / 1000) * (this.bpm / 60) * 2 * Math.PI);
    ctx.font = `${48 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText("❤️", 250, 370);
    ctx.font = "13px sans-serif"; ctx.fillText(`${this.bpm} bpm`, 250, 400);
    ctx.textAlign = "left"; ctx.fillText(this.msg, 10, 20);
  }
}
