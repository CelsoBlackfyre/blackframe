#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo "Run this script with sudo." >&2
    exit 1
fi

if [[ ! -r /etc/os-release ]]; then
    echo "Unable to identify the operating system." >&2
    exit 1
fi

# shellcheck disable=SC1091
source /etc/os-release

if [[ ${ID:-} != "ubuntu" ]]; then
    echo "This installer supports Ubuntu only." >&2
    exit 1
fi

data_root=${BLACKFRAME_DATA_ROOT:-/srv/blackframe-data}
deploy_user=${BLACKFRAME_DEPLOY_USER:-${SUDO_USER:-ubuntu}}

if ! id "$deploy_user" >/dev/null 2>&1; then
    echo "Deployment user '$deploy_user' does not exist." >&2
    exit 1
fi

install -d -m 0755 "$data_root"

if ! mountpoint -q "$data_root"; then
    echo "$data_root must be the mounted OCI block volume before setup continues." >&2
    echo "The installer will not format or mount a device automatically." >&2
    exit 1
fi

apt-get update
apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    jq \
    openssl \
    python3-pip \
    python3-venv \
    unattended-upgrades \
    ufw

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

cat >/etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt-get update
apt-get install -y --no-install-recommends \
    docker-buildx-plugin \
    docker-ce \
    docker-ce-cli \
    docker-compose-plugin \
    containerd.io

systemctl enable --now docker
systemctl enable --now unattended-upgrades
usermod -aG docker "$deploy_user"

if [[ ! -x /opt/oci-cli/bin/oci ]]; then
    python3 -m venv /opt/oci-cli
    /opt/oci-cli/bin/pip install --no-cache-dir --upgrade pip oci-cli
fi

ln -sfn /opt/oci-cli/bin/oci /usr/local/bin/oci

install -d -m 0700 -o "$deploy_user" -g "$deploy_user" \
    "$data_root/backups" \
    "$data_root/config"
install -d -m 0750 -o 33 -g 33 \
    "$data_root/post-media" \
    "$data_root/public-media"
install -d -m 0700 -o 999 -g 999 "$data_root/postgres"
install -d -m 0700 -o root -g root \
    "$data_root/caddy" \
    "$data_root/caddy/config" \
    "$data_root/caddy/data"

echo "Host dependencies and persistent directories are ready."
echo "Log out and back in before running Docker as $deploy_user."
echo "Configure OCI network rules and UFW before deploying the application."
