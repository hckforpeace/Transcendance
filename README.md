# 🕹️ Transcendance

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Made at 42](https://img.shields.io/badge/Made%20at-42-blue)](https://42.fr)
[![Dockerized](https://img.shields.io/badge/Dockerized-Yes-blue)](https://www.docker.com/)
[![Security](https://img.shields.io/badge/Security-2FA%20%2B%20Vault%20%2B%20WAF-critical)]()

**Transcendance** is the final project of the common core at **42 School**.  
The objective is to build a secure, accessible, and intelligent web application where users can log in, play Pong, compete in tournaments, and much more.

📄 Find the project requirements here: `Documentation/Transcendance.pdf`.

---

## 👨‍💻 Team Members

This project was built by:

- [hckforpeace](https://github.com/hckforpeace)  
- [salamientark](https://github.com/salamientark)  
- [AwkwardDark](https://github.com/AwkwardDark)  
- [M_Martin](https://github.com/renardo13)

---

## 🧩 Implemented Modules

### 🔗 Web

- **Major:** Backend using **Node.js** and **Fastify**
- **Minor:** Frontend with **TailwindCSS**
- **Minor:** Persistent data with **SQLite**

### 👥 User Management

- **Major:** User authentication and identity across tournaments
- **Major:** **Google Sign-In** support

### 🧠 AI Algorithm

- **Major:** AI opponent powered by **Q-Learning**

### 🔐 Cybersecurity

- **Major:** **ModSecurity WAF** with hardened config + **HashiCorp Vault**
- **Major:** **JWT** & **Two-Factor Authentication (2FA)**
- **Minor:** **GDPR compliance** (anonymization, local data, account deletion)

### ⚙️ DevOps

- **Minor:** **Monitoring** using **Grafana** and **Prometheus**

### ♿ Accessibility

- **Minor:** Browser compatibility improvements
- **Minor:** Full support for desktop, tablet, and mobile

---

## 🚀 How to Run the Project

```bash
make
```
## ⚠️ Configuration Warning

> **Before running the project**, make sure to configure your environment variables properly.

You **must** edit the following files:

- `./srcs/requirements/vault/init/environment.sh`
- `./srcs/.env`

Also, **check** the `docker-compose.yml` file for any additional environment variables that may need to be adjusted — especially for services such as:

- 🔧 **Grafana**
- 🔐 **Vault**
- 📊 **Prometheus**
- 🛡️ **ModSecurity**

---


