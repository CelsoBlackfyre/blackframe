# Oracle Cloud deployment

This directory contains the production runbook for a single Oracle Cloud
Infrastructure (OCI) Always Free Ampere A1 VM. The VM runs Caddy, the Laravel
web process, a database queue worker, and PostgreSQL with Docker Compose.

The first launch is deliberately private: Caddy listens only on the VM's
loopback interface, and an SSH tunnel carries browser traffic. Do not accept
real users until a domain is configured with publicly trusted HTTPS.

## 1. Create the OCI resources

Create all Always Free resources in the tenancy's home region:

- One `VM.Standard.A1.Flex` Ubuntu 24.04 image with 2 OCPUs, 12 GB RAM, and a
  50 GB boot volume.
- One blank 100 GB block volume attached to the VM.
- A VCN, public subnet, internet gateway, route rule, and reserved public IPv4
  address.
- An NSG that allows TCP 22 only from the administrator's current public
  IP/CIDR. Do not add ingress for 80, 443, or 5432 yet.
- The administrator's SSH **public** key. Never upload or paste the private key.

Oracle's current allowances and reclamation rules are documented under
[Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm).

## 2. Mount the data volume

SSH to the instance as `ubuntu`, inspect the attached devices with `lsblk -f`,
and follow Oracle's block-volume instructions to create an ext4 filesystem on
the new, blank device. Verify the exact device before formatting it; formatting
the wrong device destroys its contents.

Mount the filesystem at `/srv/blackframe-data` by UUID through `/etc/fstab`, then
verify both commands succeed:

```bash
sudo mount -a
mountpoint /srv/blackframe-data
```

The host installer refuses to continue unless that path is a distinct mounted
filesystem.

## 3. Install the host runtime

Clone the public repository and run the idempotent Ubuntu installer:

```bash
sudo install -d -o ubuntu -g ubuntu /opt/blackframe
git clone https://github.com/CelsoBlackfyre/blackframe.git /opt/blackframe
sudo BLACKFRAME_DATA_ROOT=/srv/blackframe-data \
  /opt/blackframe/deploy/oracle/install-host.sh
```

The installer adds Docker Engine, Buildx, the Compose plugin, the OCI CLI, UFW,
automatic security-update support, and the persistent directory structure. Log
out and reconnect so the `docker` group membership takes effect.

Keep both the OCI NSG and the host firewall narrow during private validation:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from <ADMIN_PUBLIC_IP/CIDR> to any port 22 proto tcp
sudo ufw --force enable
sudo ufw status verbose
```

Confirm the SSH allow rule before enabling UFW so the VM is not locked out.

## 4. Create the production environment

Copy the template outside the Git checkout and restrict it to the deployment
user. The compose file reads the env file from Dokploy's persistent service
directory by default (`/etc/dokploy/blackframe/app.env`), so place it there
on hosts managed by Dokploy; on a bare Oracle VM keep using the data root:

```bash
sudo install -d -m 700 /etc/dokploy/blackframe
cp /opt/blackframe/.env.production.example \
  /etc/dokploy/blackframe/app.env
chmod 600 /etc/dokploy/blackframe/app.env
```

Generate, rather than invent, the two primary secrets:

```bash
docker run --rm php:8.4-cli \
  php -r 'echo "base64:".base64_encode(random_bytes(32)).PHP_EOL;'
openssl rand -hex 32
```

Place the first result in `APP_KEY` and the second in `DB_PASSWORD`. Configure
the SMTP host, port, encryption, username, password/token, and sender address in
the same file. Keep the initial network values unchanged:

```dotenv
APP_URL=http://127.0.0.1:8080
APP_TRUSTED_HOSTS=127.0.0.1,localhost
SESSION_SECURE_COOKIE=false
CADDY_SITE_ADDRESS=http://
BLACKFRAME_HTTP_BIND=127.0.0.1:8080
BLACKFRAME_HTTPS_BIND=127.0.0.1:8443
```

Do not commit this file, paste it into chat, or copy it into `/opt/blackframe`.

## 5. Deploy and validate privately

Run the manual release command after the GitHub Actions checks on `main` pass:

```bash
/opt/blackframe/deploy/oracle/deploy.sh
```

The command refuses a dirty checkout, fast-forwards `main`, validates Compose,
builds the production image, starts PostgreSQL, creates a pre-migration backup,
runs migrations, starts the complete stack, and checks `/up`.

From the administrator's computer, open the tunnel and leave it running:

```bash
ssh -L 8080:127.0.0.1:8080 ubuntu@<RESERVED_PUBLIC_IP>
```

Visit `http://127.0.0.1:8080`. Exercise registration, login, password reset,
post upload and retrieval, and private-profile access. No application service
or database port should be reachable directly from the internet.

## 6. Configure private backups

Create a private standard-tier Object Storage bucket, for example
`blackframe-backups`. Create a dynamic group matching only this instance:

```text
instance.id = '<INSTANCE_OCID>'
```

Grant the dynamic group access only to the backup bucket:

```text
Allow dynamic-group BlackFrameBackupVMs to read buckets in compartment <COMPARTMENT_NAME> where target.bucket.name = 'blackframe-backups'
Allow dynamic-group BlackFrameBackupVMs to manage objects in compartment <COMPARTMENT_NAME> where target.bucket.name = 'blackframe-backups'
```

The VM then uploads through its instance principal; no user API key is stored on
the server. Copy and edit the non-secret backup settings:

```bash
cp /opt/blackframe/deploy/oracle/backup.env.example \
  /srv/blackframe-data/config/backup.env
chmod 600 /srv/blackframe-data/config/backup.env
```

From an administrator workstation with an OCI CLI profile and this repository
checked out, apply the eight-day prefix-scoped storage lifecycle policy:

```bash
oci os object-lifecycle-policy put \
  --bucket-name blackframe-backups \
  --items file://./deploy/oracle/object-lifecycle-items.json \
  --force
```

Install and activate the nightly timer:

```bash
sudo install -m 0644 /opt/blackframe/deploy/oracle/systemd/blackframe-backup.service /etc/systemd/system/
sudo install -m 0644 /opt/blackframe/deploy/oracle/systemd/blackframe-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now blackframe-backup.timer
sudo systemctl start blackframe-backup.service
sudo systemctl status blackframe-backup.service
```

The backup includes a compressed PostgreSQL dump, private post media, public
media, and SHA-256 checksums. Validate a backup in an isolated PostgreSQL
container with a new temporary data volume, without touching production:

```bash
/opt/blackframe/deploy/oracle/verify-backup.sh \
  /srv/blackframe-data/backups/<database.dump> \
  /srv/blackframe-data/backups/<media.tar.gz>
```

Monitor Object Storage usage. Always Free Object Storage is small enough that a
growing image library will eventually require paid capacity or a different
retention strategy.

## 7. Switch to a public domain

Before public use, create an A record from the production domain to the reserved
OCI address. In both the OCI NSG and UFW, allow TCP 80 and 443 from the internet;
continue restricting SSH and never open PostgreSQL.

Update `app.env` atomically with the real domain:

```dotenv
APP_URL=https://social.example.com
APP_TRUSTED_HOSTS=social.example.com,127.0.0.1,localhost
SESSION_SECURE_COOKIE=true
CADDY_SITE_ADDRESS=social.example.com
BLACKFRAME_HTTP_BIND=0.0.0.0:80
BLACKFRAME_HTTPS_BIND=0.0.0.0:443
```

Run `deploy.sh` again. Caddy will request the public certificate, redirect HTTP
to HTTPS, and renew the certificate automatically. Verify HTTPS, secure cookies,
password-reset links, rejected untrusted hosts, and `/up` before inviting users.

## Operations

Useful commands from `/opt/blackframe`:

```bash
docker compose --env-file /srv/blackframe-data/config/app.env \
  -f compose.production.yaml ps
docker compose --env-file /srv/blackframe-data/config/app.env \
  -f compose.production.yaml logs --tail=200 web queue caddy
sudo systemctl list-timers blackframe-backup.timer
```

Every deployment records the Git revision in its output and creates a backup
before migrations. To roll application code back, check out a known-good commit,
build it with the same Compose file, and restart the stack. Database rollback is
not automatic; restore a verified dump when a migration is not backward
compatible.

## Inputs needed for an assisted deployment

- OCI home region, compartment name/OCID, instance OCID, and reserved IP.
- Administrator source IP/CIDR and SSH public key.
- The local path to the SSH private key if commands are to be run from another
  machine; never the private-key contents.
- An already configured OCI CLI administrator profile if provisioning is to be
  automated.
- Application name, timezone, locale, SMTP settings, sender identity, and
  optional TMDB token.
- The domain and DNS access before the public HTTPS cutover.

Oracle passwords, MFA codes, payment data, raw API private keys, Laravel keys,
database passwords, and SMTP tokens should never be provided through chat.
