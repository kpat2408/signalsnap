from flask import Flask, render_template, request, jsonify
from simulate import simulate

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/run", methods=["POST"])
def run():
    program = request.get_json()
    return jsonify(simulate(program))


if __name__ == "__main__":
    app.run(debug=True)
