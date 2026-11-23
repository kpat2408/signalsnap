from collections import deque

HIGH_THRESHOLD = 5   # a molecule is "HIGH" once its count reaches this
MAX_STEPS = 200      # safety limit so a bad script can't loop forever


def simulate(program):
    start = program.get("start", [])
    rules = program.get("rules", [])

    events = []          # what the stage will animate, in order
    broken = set()
    proteins_on = set()
    molecules = {}
    actions_done = []
    high_fired = set()
    queue = deque()      # triggers waiting to be handled

    def run_actions(actions):
        for a in actions:
            op, name = a.get("op"), a.get("name")
            if op == "release":
                events.append({"type": "release", "name": name})
                queue.append(("signal", name))
            elif op == "break":
                broken.add(name)
                events.append({"type": "break", "name": name})
            elif op == "protein_on":
                if name in broken:
                    events.append({"type": "blocked", "name": name})
                elif name not in proteins_on:
                    proteins_on.add(name)
                    events.append({"type": "protein_on", "name": name})
                    queue.append(("protein_on", name))
            elif op == "make":
                n = int(a.get("count", 1))
                molecules[name] = molecules.get(name, 0) + n
                events.append({"type": "make", "name": name,
                               "count": n, "total": molecules[name]})
                if molecules[name] >= HIGH_THRESHOLD and name not in high_fired:
                    high_fired.add(name)
                    queue.append(("high", name))
            elif op == "cell_does":
                actions_done.append(name)
                events.append({"type": "cell_action", "name": name})

    # Apply experiments (breaks) first, so they affect the whole run
    run_actions([a for a in start if a.get("op") == "break"])
    run_actions([a for a in start if a.get("op") != "break"])

    steps = 0
    while queue and steps < MAX_STEPS:
        steps += 1
        trigger = queue.popleft()
        for rule in rules:
            if (rule["when"]["type"], rule["when"]["name"]) == trigger:
                run_actions(rule["do"])

    return {
        "events": events,
        "final": {
            "proteins_on": sorted(proteins_on),
            "molecules": molecules,
            "actions": actions_done,
            "broken": sorted(broken),
        },
    }
