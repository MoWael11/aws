

  sudo apt-get update && sudo apt-get install -y hello



  sudo python3 -c '
path = "/var/lib/dpkg/status"
with open(path, "r") as f:
    blocks = f.read().split("\n\n")
for i, block in enumerate(blocks):
    if "Package: hello\n" in block or block.startswith("Package: hello\n"):
        lines = block.split("\n")
        for j, line in enumerate(lines):
            if line.startswith("Version:"):
                lines[j] = "Version: 1.0-mockold"
        blocks[i] = "\n".join(lines)
with open(path, "w") as f:
    f.write("\n\n".join(blocks))
'



echo 'Unattended-Upgrade::Allowed-Origins { "${distro_id}:${distro_codename}"; };' | sudo tee /etc/apt/apt.conf.d/99test-patch


sudo apt-get update
apt-cache policy hello


sudo unattended-upgrade --dry-run --debug



sudo rm -f /etc/apt/apt.conf.d/99test-patch
sudo apt-get update
sudo apt-get install --reinstall -y hello