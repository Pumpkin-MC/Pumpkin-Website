#!/bin/sh
# Pumpkin Package Manager (ppm) Installer
# Usage: curl -sSfL https://pumpkinmc.org/ppm.sh | sh
set -e

REPO="${PPM_REPO:-Pumpkin-MC/ppm}"
TAG="${PPM_TAG:-latest}"
INSTALL_DIR="${PPM_INSTALL_DIR:-}"

# ANSI colours (disabled if not a terminal or NO_COLOR is set)
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD="\033[1m"
  ORANGE="\033[38;5;208m"
  GREEN="\033[32m"
  RED="\033[31m"
  RESET="\033[0m"
else
  BOLD="" ORANGE="" GREEN="" RED="" RESET=""
fi

info()    { printf "${ORANGE}${BOLD}[ppm]${RESET} %s\n" "$*"; }
success() { printf "${GREEN}${BOLD}[ppm]${RESET} %s\n" "$*"; }
error()   { printf "${RED}${BOLD}[ppm] error:${RESET} %s\n" "$*" >&2; exit 1; }

# ── OS / arch detection ───────────────────────────────────────────────────────

detect_os() {
  case "$(uname -s)" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *)       error "Unsupported OS: $(uname -s). Please download manually from https://github.com/${REPO}/releases" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64) echo "X64" ;;
    aarch64|arm64) echo "ARM64" ;;
    *) error "Unsupported architecture: $(uname -m). Please download manually from https://github.com/${REPO}/releases" ;;
  esac
}

is_musl() {
  if [ -f /etc/alpine-release ]; then
    return 0
  fi
  if command -v ldd >/dev/null 2>&1 && ldd /bin/sh 2>&1 | grep -qi "musl"; then
    return 0
  fi
  return 1
}

# ── Dependency checks ─────────────────────────────────────────────────────────

need_cmd() {
  if ! command -v "$1" > /dev/null 2>&1; then
    error "Required command not found: $1. Please install it and try again."
  fi
}

need_cmd curl

# ── Build download URL ────────────────────────────────────────────────────────

OS=$(detect_os)
ARCH=$(detect_arch)

case "$OS" in
  linux)
    if [ "$ARCH" = "X64" ]; then
      if is_musl; then
        BINARY_NAME="ppm-X64-Linux-musl"
      else
        BINARY_NAME="ppm-X64-Linux"
      fi
    elif [ "$ARCH" = "ARM64" ]; then
      BINARY_NAME="ppm-ARM64-Linux"
    else
      error "Unsupported Linux architecture: $ARCH"
    fi
    ;;
  macos)
    if [ "$ARCH" != "ARM64" ]; then
      error "Unsupported macOS architecture: $(uname -m). Currently only Apple Silicon (ARM64) builds are available."
    fi
    BINARY_NAME="ppm-ARM64-macOS"
    ;;
  windows)
    if [ "$ARCH" != "X64" ]; then
      error "Unsupported Windows architecture: $(uname -m). Only x86_64 builds are available."
    fi
    BINARY_NAME="ppm-X64-Windows.exe"
    ;;
esac

if [ "$TAG" = "latest" ]; then
  DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"
else
  DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${TAG}/${BINARY_NAME}"
fi

# ── Download to temporary location ───────────────────────────────────────────

TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'ppm-install')
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

if [ "$OS" = "windows" ]; then
  DEST="${TMP_DIR}/ppm.exe"
else
  DEST="${TMP_DIR}/ppm"
fi

info "Detected: ${OS} / ${ARCH}"
info "Downloading Pumpkin Package Manager (ppm) from GitHub releases..."

if [ -t 1 ]; then
  curl -fL --progress-bar -o "$DEST" "$DOWNLOAD_URL" || \
    error "Download failed. Check your internet connection or visit https://github.com/${REPO}/releases"
else
  curl -sSfL -o "$DEST" "$DOWNLOAD_URL" || \
    error "Download failed. Check your internet connection or visit https://github.com/${REPO}/releases"
fi

chmod +x "$DEST"

# ── Run ppm self-install ─────────────────────────────────────────────────────

info "Running ppm self-installer..."

SELF_INSTALL_ARGS="--force"
if [ -n "$INSTALL_DIR" ]; then
  SELF_INSTALL_ARGS="${SELF_INSTALL_ARGS} --dir ${INSTALL_DIR}"
fi

"$DEST" self-install $SELF_INSTALL_ARGS || \
  error "ppm self-install failed. Please inspect permissions or try with custom PPM_INSTALL_DIR."

# ── Done ──────────────────────────────────────────────────────────────────────

printf "\n"
success "ppm installed successfully!"
printf "\n"
info "Quick start:"
printf "  ${BOLD}ppm --help${RESET}\n"
printf "  ${BOLD}ppm search <query>${RESET}     - Search marketplace plugins\n"
printf "  ${BOLD}ppm install <plugin>${RESET}   - Install plugin into your server\n"
printf "  ${BOLD}ppm new my-plugin${RESET}      - Scaffold a new plugin project\n"
printf "\n"
info "Marketplace: https://market.pumpkinmc.org"
info "Docs: https://github.com/${REPO}#readme"
