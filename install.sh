#!/bin/sh
# Pumpkin Installer
# Usage: curl -sSfL https://pumpkinmc.org/install.sh | sh
set -e

REPO="${PUMPKIN_REPO:-Pumpkin-MC/Pumpkin}"
TAG="${PUMPKIN_TAG:-nightly}"
INSTALL_DIR="${PUMPKIN_INSTALL_DIR:-./pumpkin-server}"

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

info()    { printf "${ORANGE}${BOLD}[pumpkin]${RESET} %s\n" "$*"; }
success() { printf "${GREEN}${BOLD}[pumpkin]${RESET} %s\n" "$*"; }
error()   { printf "${RED}${BOLD}[pumpkin] error:${RESET} %s\n" "$*" >&2; exit 1; }

# ── OS / arch detection ───────────────────────────────────────────────────────

detect_os() {
  if [ "$(uname -o 2>/dev/null)" = "Android" ] || [ -n "${ANDROID_ROOT:-}" ] || (command -v getprop >/dev/null 2>&1 && [ -n "$(getprop ro.build.version.release 2>/dev/null)" ]); then
    echo "android"
    return
  fi

  case "$(uname -s)" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
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
    BINARY_NAME="pumpkin-${ARCH}-Linux"
    ;;
  macos)
    BINARY_NAME="pumpkin-${ARCH}-macOS"
    ;;
  android)
    if [ "$ARCH" != "ARM64" ]; then
      error "Unsupported Android architecture: $(uname -m). Only ARM64 (aarch64) builds are available."
    fi
    BINARY_NAME="pumpkin-aarch64-android"
    ;;
esac

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${TAG}/${BINARY_NAME}"

# ── Download ──────────────────────────────────────────────────────────────────

info "Detected: ${OS} / ${ARCH}"
info "Downloading Pumpkin from GitHub releases..."

mkdir -p "$INSTALL_DIR"
DEST="${INSTALL_DIR}/pumpkin"

if [ -t 1 ]; then
  curl -fL --progress-bar -o "$DEST" "$DOWNLOAD_URL" || \
    error "Download failed. Check your internet connection or visit https://github.com/${REPO}/releases"
else
  curl -sSfL -o "$DEST" "$DOWNLOAD_URL" || \
    error "Download failed. Check your internet connection or visit https://github.com/${REPO}/releases"
fi

chmod +x "$DEST"

# ── Done ──────────────────────────────────────────────────────────────────────

success "Pumpkin installed to ${DEST}"
printf "\n"
info "To start your server, run:"
printf "  ${BOLD}cd %s && ./pumpkin${RESET}\n" "$INSTALL_DIR"
printf "\n"
info "Docs: https://docs.pumpkinmc.org/"
info "Issues: https://github.com/${REPO}/issues"
