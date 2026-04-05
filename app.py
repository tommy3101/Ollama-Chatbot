from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",
                "prompt": user_message,
                "stream": False
            }
        )

        result = response.json()
        reply = result.get("response", "No response")

        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"reply": "Error connecting to Ollama"}), 500


if __name__ == "__main__":
    app.run(debug=True)