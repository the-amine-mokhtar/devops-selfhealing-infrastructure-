from flask import Flask, request, jsonify
from kubernetes import client, config
import datetime
import os

app = Flask(__name__)
config.load_incluster_config()
apps_v1 = client.AppsV1Api()

LOG_PATH = "/var/log/remediation.log"

def log_action(message):
    line = f"{datetime.datetime.utcnow().isoformat()} - {message}\n"
    with open(LOG_PATH, "a") as f:
        f.write(line)
    print(line, flush=True)

@app.route("/alert", methods=["POST"])
def handle_alert():
    payload = request.json
    alerts = payload.get("alerts", [])
    for alert in alerts:
        status = alert.get("status")
        labels = alert.get("labels", {})
        alertname = labels.get("alertname", "unknown")
        deployment = labels.get("deployment") or labels.get("pod", "").rsplit("-", 2)[0]
        namespace = labels.get("namespace", "default")

        if status == "firing" and deployment:
            try:
                apps_v1.patch_namespaced_deployment(
                    name=deployment,
                    namespace=namespace,
                    body={"spec": {"template": {"metadata": {"annotations": {
                        "kubectl.kubernetes.io/restartedAt": datetime.datetime.utcnow().isoformat()
                    }}}}}
                )
                log_action(f"ALERT={alertname} ACTION=restart DEPLOYMENT={deployment} NAMESPACE={namespace} RESULT=success")
            except Exception as e:
                log_action(f"ALERT={alertname} ACTION=restart DEPLOYMENT={deployment} NAMESPACE={namespace} RESULT=failed ERROR={e}")
        else:
            log_action(f"ALERT={alertname} STATUS={status} — no action taken")

    return jsonify({"status": "received"}), 200

@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
