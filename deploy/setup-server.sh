#!/usr/bin/env bash
# ==============================================================================
# Aatitheyam Cafe & Bhojnalaya - Cloud VPS Production Setup Script
# Target OS: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ==============================================================================

set -euo pipefail

echo "==========================================================="
echo "  Setting up Aatitheyam Cafe & Bhojnalaya Server           "
echo "==========================================================="

# 1. Update system packages
echo "[1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw ca-certificates gnupg lsb-release

# 2. Configure UFW Firewall
echo "[2/6] Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo ufw status verbose

# 3. Install Docker Engine & Docker Compose
echo "[3/6] Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "Docker installed successfully."
else
    echo "Docker is already installed."
fi

# 4. Generate Production Secrets if .env doesn't exist
echo "[4/6] Checking production environment file (.env)..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate secure random SECRET_KEY and POSTGRES_PASSWORD
    RAND_SECRET=$(openssl rand -hex 32)
    RAND_DB_PASS=$(openssl rand -hex 16)
    
    sed -i "s|SECRET_KEY=.*|SECRET_KEY=\"${RAND_SECRET}\"|g" .env
    sed -i "s|postgrespassword|${RAND_DB_PASS}|g" .env
    echo "Generated secure random SECRET_KEY and DB password in .env."
fi

# 5. Build and Launch Containers
echo "[5/6] Building and starting Docker services..."
docker compose up -d --build

# 6. Verify Health Status
echo "[6/6] Verifying application services..."
sleep 5
docker compose ps

echo "==========================================================="
echo "  Deployment Complete!                                     "
echo "  Application is running on Port 80.                       "
echo "  To configure SSL, run: bash deploy/init-ssl.sh <domain> <email>"
echo "==========================================================="
