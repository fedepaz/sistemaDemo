# ☁️ Cloudflare SSH Tunnel Setup

_Bulletproof secure remote access without open ports._

This guide explains how to expose your server's SSH service through a **Cloudflare Tunnel**. This method is extremely secure because it doesn't require opening any ports in your router's firewall; the connection is initiated from the server to Cloudflare.

---

## 📋 Prerequisites

- **Server**: A Linux machine (Home PC, VPS, Raspberry Pi, etc.).
- **Domain**: A domain name managed by Cloudflare (Free plan works perfectly).
- **Tools**: `cloudflared` installed on both the server and the client (laptop).
- **SSH Service**: SSH must be enabled on the server (`sudo systemctl enable ssh`).

---

## 🚀 Step-by-Step Implementation

### 1. On the Server: Install and Authenticate

First, download the latest version of the Cloudflare agent and log in to your account.

```bash
# Download cloudflared (adjust for your architecture)
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate with Cloudflare
cloudflared tunnel login
```

_Follow the URL provided in the terminal to authorize your domain._

### 2. Create the SSH Tunnel

Create a dedicated tunnel for your SSH traffic.

```bash
cloudflared tunnel create ssh-tunnel
```

_This will generate a credentials JSON file in `~/.cloudflared/`. Note the Tunnel ID._

### 3. Configure the Tunnel

Create the configuration file at `~/.cloudflared/config-ssh.yml`:

```yaml
tunnel: ssh-tunnel
credentials-file: /home/youruser/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: ssh.yourdomain.com
    service: ssh://localhost:22
  - service: http_status:404
```

### 4. Run as a System Service

To ensure the tunnel starts automatically, create a systemd service file at `/etc/systemd/system/cloudflared-ssh.service`:

```ini
[Unit]
Description=Cloudflare Tunnel for SSH
After=network.target

[Service]
Type=simple
User=youruser
ExecStart=/usr/bin/cloudflared --no-autoupdate tunnel --config /home/youruser/.cloudflared/config-ssh.yml run
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Enable and start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-ssh
sudo systemctl start cloudflared-ssh
```

### 5. Route the DNS

Link your tunnel to a specific subdomain:

```bash
cloudflared tunnel route dns ssh-tunnel ssh.yourdomain.com
```

---

## 💻 Client Connection (Your Laptop)

### 6. Connect via SSH

On your client machine, you can connect using the `cloudflared` proxy command:

```bash
ssh -o ProxyCommand="cloudflared access ssh --hostname %h" youruser@ssh.yourdomain.com
```

### 💡 Pro-Tip: SSH Config Alias

Add this to your `~/.ssh/config` to make connecting easier:

```text
Host my-remote
    HostName ssh.yourdomain.com
    User youruser
    ProxyCommand cloudflared access ssh --hostname %h
```

Now you can simply run: `ssh my-remote`.

---

## 🛠️ Troubleshooting

- **DNS Resolution Failure**: If your client can't find the host, check your `/etc/resolv.conf`. Replacing it with `nameserver 1.1.1.1` often fixes issues with local resolvers.
- **Service Exits Immediately**: Verify the command syntax in your `.service` file. It should be `tunnel --config <file> run`.
- **`dial tcp: lookup...`**: Usually a client-side DNS cache issue. Flush your DNS or use a static resolver.

---

## 🔑 Key Learning Points

1. **Zero Open Ports**: No router port forwarding needed; the tunnel initiates the connection.
2. **Multi-Service**: You can run multiple tunnels on the same server (one for Web, one for SSH).
3. **TCP Forwarding**: Cloudflare Tunnel can forward any TCP service, not just HTTP traffic.
4. **Zero Trust**: You can optionally add Cloudflare Access (SSO/MFA) for an extra layer of security.

---

## 🔐 Guide: Secure SSH Key Configuration & Hardening

This guide details how to set up passwordless access using modern SSH keys and how to secure the server by disabling password-based authentication.

### 1. Client-Side Setup (Laptop/PC)

#### A. Generate SSH Keys
Create a modern, secure key pair. Using ED25519 is recommended for its security and performance.
```bash
# Default key (Press Enter for all prompts)
ssh-keygen -t ed25519 -C "your-identifier"

# Named key (to separate work from personal)
ssh-keygen -t ed25519 -f ~/.ssh/work-server-key
```
- **Private Key**: `~/.ssh/id_ed25519` (Keep this secret and never share it!)
- **Public Key**: `~/.ssh/id_ed25519.pub` (This is safe to share)

#### B. Configure SSH Alias
Edit your `~/.ssh/config` file to add a persistent alias for the server:
```text
Host server-ssh
    HostName ssh.your-domain.com
    User your-username
    ProxyCommand cloudflared access ssh --hostname %h
```

#### C. Deploy the Public Key
Upload your public key to the server. You will be asked for your password one last time.
```bash
ssh-copy-id server-ssh
```

### 2. Server-Side Hardening

**Important:** Confirm you can log in via `ssh server-ssh` without a password before proceeding.

#### A. Edit SSH Configuration
Modify the system's SSH daemon rules:
```bash
sudo nano /etc/ssh/sshd_config
```

#### B. Enforce Security Rules
Ensure the following lines are set correctly (remove any leading `#`):
- `PubkeyAuthentication yes`: Enables key-based access.
- `PasswordAuthentication no`: Disables insecure password logins.
- `ChallengeResponseAuthentication no`: Disables interactive login methods.

#### C. Restart the Service
Apply the changes to the system:
```bash
sudo systemctl restart ssh
```

---

### 📋 Technical Summary

| Context | Location | Description |
| :--- | :--- | :--- |
| **Local Machine** | `~/.ssh/` | Your digital identity. **Never share keys without the `.pub` extension**. |
| **Server (User)** | `~/.ssh/authorized_keys` | Registry of public keys authorized to access your user account. |
| **Server (System)** | `/etc/ssh/sshd_config` | Master configuration for global SSH security policies. |
