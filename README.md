# Self-Healing DevOps Platform

A self-hosted DevOps lab built on a single ESXi 6.7 host, demonstrating a full CI/CD-to-production pipeline with automated monitoring, alerting, and self-healing remediation — built for a Spring Boot (backend) + Angular (frontend) test application.

## Goal

Simulate a small but complete production platform: code push → automated build/test → containerized deploy → live monitoring → automatic recovery from failures — all running on lab-grade hardware (single host, 12GB RAM).

## Stack

| Layer | Tool |
|---|---|
| Virtualization | VMware ESXi 6.7 (standalone, no vCenter) |
| Provisioning | govc (vmkfstools disk clone + registration) |
| Configuration management | Ansible (roles: k3s_cluster, platform, monitoring) |
| Container orchestration | k3s via k3d (1 server + 2 agent nodes) |
| Ingress | ingress-nginx |
| Git hosting / CI-CD | Gitea (+ Gitea Actions runner) |
| Monitoring | Prometheus, Grafana, Alertmanager |
| Application | Spring Boot (backend) + Angular (frontend) |
| Self-healing | Kubernetes liveness/readiness probes, HPA, remediation webhook |

## Key Infrastructure Decisions

- Standalone ESXi 6.7 (no vCenter) blocks Terraform vsphere clone — used vmkfstools + govc instead.
- k3d chosen over full k3s/k8s for RAM efficiency in a single lab VM.
- Gitea chosen over GitHub/Azure Repos to keep the platform fully self-hosted.

## Chaos Testing (planned)

- Pod crash recovery
- Node failure (kill a k3d agent)
- CPU stress -> HPA scale-out
- Bad deployment -> automatic rollback
- VM-level failure (govc vm.power -off k3s-cluster-vm)

---
Lab environment - built for learning/demonstration purposes.
