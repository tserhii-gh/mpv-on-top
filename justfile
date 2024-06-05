# Expand path patterns like **/*.ui
set shell := ['bash', '-O', 'globstar', '-c']

uuid := 'mpv-on-top@tserhii-gh.github.com'

# Build and install the extension from source
install:
  rm -rf ~/.local/share/gnome-shell/extensions/{{uuid}}
  mkdir -p ~/.local/share/gnome-shell/extensions/{{uuid}}
  cp {extension.js,metadata.json} ~/.local/share/gnome-shell/extensions/{{uuid}}

