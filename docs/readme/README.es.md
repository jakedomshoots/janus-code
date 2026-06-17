<h1 align="center">
  <a href="https://github.com/jakedomshoots/janus-code"><img src="../../resources/build/icon.png" alt="Janus Code" width="64" valign="middle" /></a> Janus Code
</h1>

<p align="center">
  <a href="https://github.com/jakedomshoots/janus-code/stargazers"><img src="https://badgen.net/github/stars/jakedomshoots/janus-code?label=%E2%98%85" alt="Estrellas en GitHub" /></a>
  <a href="https://github.com/jakedomshoots/janus-code/releases"><img src="https://img.shields.io/github/downloads/jakedomshoots/janus-code/total?label=downloads" alt="Descargas totales en todas las versiones" /></a>
  <img src="https://badgen.net/github/license/jakedomshoots/janus-code" alt="Licencia" />
  <img src="https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Plataformas compatibles: macOS, Windows y Linux" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a></sub>
</p>

<p align="center">
  <strong>El orquestador de IA para desarrolladores 100x.</strong><br/>
  Ejecuta Claude Code, OpenClaude, Codex u OpenCode en paralelo — cada uno en su propio worktree, supervisados desde un solo lugar.
</p>

<h3 align="center"><a href="https://github.com/jakedomshoots/janus-code/download"><ins>Descargar Janus Code</ins></a></h3>

<p align="center">
  <img src="../assets/readme-hero.jpg" alt="La app de escritorio de Janus Code ejecutando agentes en worktrees paralelos, con la app companion móvil de Janus Code en la esquina" width="960" />
</p>

## Características

<table>
<tr>
<td width="50%" valign="middle">

### App companion móvil

Supervisa y dirige a tus agentes desde el teléfono — recibe una notificación cuando un agente termine y envía instrucciones de seguimiento desde cualquier lugar.

[App Store de iOS](https://apps.apple.com/us/app/janus-code/id6766130217) · [APK para Android](https://github.com/jakedomshoots/janus-code/releases/download/mobile-v0.0.13/app-release.apk) · [Docs →](https://www.github.com/jakedomshoots/janus-code/docs/mobile)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/mobile"><picture><source srcset="../assets/feature-wall/mobile-companion-app-showcase.gif" type="image/gif"><img src="../assets/feature-wall/mobile-companion-app-showcase.jpg" alt="Janus Code de escritorio con la app companion móvil" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Worktrees en paralelo

Lanza un mismo prompt a cinco agentes, cada uno en su propio worktree de git aislado — compara los resultados y haz merge del ganador.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/model/worktrees)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/model/worktrees"><picture><source srcset="../assets/feature-wall/parallel-worktrees.gif" type="image/gif"><img src="../assets/feature-wall/parallel-worktrees.jpg" alt="Orquestación de worktrees en paralelo" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Terminales divididas

Terminales de nivel Ghostty con renderizado WebGL, divisiones infinitas y un scrollback que sobrevive a los reinicios.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/terminal)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/terminal"><picture><source srcset="../assets/feature-wall/terminal-splits.gif" type="image/gif"><img src="../assets/feature-wall/terminal-splits.jpg" alt="Terminales divididas" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Modo diseño

Haz clic en cualquier elemento de UI en una ventana real de Chromium para enviar su HTML, su CSS y una captura recortada directo al prompt de tu agente.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/browser/design-mode)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/browser/design-mode"><picture><source srcset="../assets/feature-wall/design-mode.gif" type="image/gif"><img src="../assets/feature-wall/design-mode.jpg" alt="Navegador integrado y modo diseño" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### GitHub y Linear, nativos

Explora PRs, issues y tableros de proyecto dentro de la app — abre un worktree desde cualquier tarea y revisa sin cambiar de contexto.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/review/linear)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/review/linear"><picture><source srcset="../assets/feature-wall/github-linear.gif" type="image/gif"><img src="../assets/feature-wall/github-linear.jpg" alt="Flujos de trabajo de GitHub y Linear en Janus Code" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Worktrees por SSH

Ejecuta agentes en una máquina remota potente con edición completa de archivos, git y terminales — con reconexión automática y reenvío de puertos incluidos.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/ssh)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/ssh"><picture><source srcset="../assets/feature-wall/ssh-worktrees.gif" type="image/gif"><img src="../assets/feature-wall/ssh-worktrees.jpg" alt="Worktrees remotos por SSH" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Anotar diffs de IA

Deja comentarios en cualquier línea de un diff y envíalos de vuelta al agente — revisa, edita y haz commit sin salir de Janus Code.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/review/annotate-ai-diff)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/review/annotate-ai-diff"><picture><source srcset="../assets/feature-wall/annotate-diff.gif" type="image/gif"><img src="../assets/feature-wall/annotate-diff.jpg" alt="Anotar diffs generados por IA" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Arrastra archivos a los agentes

El editor de VS Code con autoguardado en todas partes — arrastra archivos o imágenes directo al prompt de un agente.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/editing/file-explorer)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/editing/file-explorer"><picture><source srcset="../assets/feature-wall/file-drag.gif" type="image/gif"><img src="../assets/feature-wall/file-drag.jpg" alt="Arrastra archivos e imágenes al prompt de un agente" width="100%" /></picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Janus CLI

Los agentes también manejan Janus Code — automatiza cualquier flujo de trabajo con `janus worktree create`, `snapshot`, `click` y `fill`.

[Docs →](https://www.github.com/jakedomshoots/janus-code/docs/cli/overview)

</td>
<td width="50%">
  <a href="https://www.github.com/jakedomshoots/janus-code/docs/cli/overview"><picture><source srcset="../assets/feature-wall/janus-cli.gif" type="image/gif"><img src="../assets/feature-wall/janus-cli.jpg" alt="Automatiza Janus Code desde la CLI" width="100%" /></picture></a>
</td>
</tr>
</table>

**También incluye:**

- **[Apertura rápida](https://www.github.com/jakedomshoots/janus-code/docs/model/quick-open)** — Busca entre worktrees, archivos, agentes, comandos y contexto del repo sin salir de tu flujo.
- **[Cambio de cuenta y seguimiento de uso](https://www.github.com/jakedomshoots/janus-code/docs/agents/usage-tracking)** — Consulta el uso de Claude y Codex y los reinicios de límites de uso, y cambia de cuenta al instante sin volver a iniciar sesión.
- **[Previews ricos del repo](https://www.github.com/jakedomshoots/janus-code/docs/editing/markdown)** — Previsualiza Markdown, imágenes, PDFs y documentos del repo en el workspace.
- **[Computer Use](https://www.github.com/jakedomshoots/janus-code/docs/cli/computer-use)** — Deja que los agentes manejen apps de escritorio y UI visible cuando un flujo de trabajo necesita interacción real.
- **[Notificaciones y estado de no leído](https://www.github.com/jakedomshoots/janus-code/docs/notifications)** — Entérate cuando un agente termine o necesite tu atención, y marca hilos como no leídos para retomarlos después.
- **Y muchas, muchas más** — lanzamos a diario, así que esta lista siempre va atrasada. El [changelog](https://github.com/jakedomshoots/janus-code/releases) es la verdadera lista de funciones.

---

## Agentes compatibles

Funciona con **cualquier agente CLI** — si corre en una terminal, corre en Janus Code.

<p>
  <a href="https://docs.anthropic.com/claude/docs/claude-code"><kbd><img src="../assets/claude-logo.svg" alt="Claude Code logo" width="16" valign="middle" /> Claude Code</kbd></a> &nbsp;
  <a href="https://github.com/openai/codex"><kbd><img src="https://www.google.com/s2/favicons?domain=openai.com&sz=64" alt="Codex logo" width="16" valign="middle" /> Codex</kbd></a> &nbsp;
  <a href="https://x.ai/cli"><kbd><img src="https://www.google.com/s2/favicons?domain=x.ai&sz=64" alt="Grok logo" width="16" valign="middle" /> Grok</kbd></a> &nbsp;
  <a href="https://github.com/google-gemini/gemini-cli"><kbd><img src="https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64" alt="Gemini logo" width="16" valign="middle" /> Gemini</kbd></a> &nbsp;
  <a href="https://cursor.com/cli"><kbd><img src="https://www.google.com/s2/favicons?domain=cursor.com&sz=64" alt="Cursor logo" width="16" valign="middle" /> Cursor</kbd></a> &nbsp;
  <a href="https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli"><kbd><img src="https://www.google.com/s2/favicons?domain=github.com&sz=64" alt="GitHub Copilot logo" width="16" valign="middle" /> GitHub Copilot</kbd></a> &nbsp;
  <a href="https://opencode.ai/docs/cli/"><kbd><img src="https://www.google.com/s2/favicons?domain=opencode.ai&sz=64" alt="OpenCode logo" width="16" valign="middle" /> OpenCode</kbd></a> &nbsp;
  <a href="https://ampcode.com/manual#install"><kbd><img src="https://www.google.com/s2/favicons?domain=ampcode.com&sz=64" alt="Amp logo" width="16" valign="middle" /> Amp</kbd></a> &nbsp;
  <a href="https://openclaude.gitlawb.com/"><kbd><img src="../../resources/openclaude-logo.png" alt="OpenClaude logo" width="16" valign="middle" /> OpenClaude</kbd></a> &nbsp;
  <a href="https://antigravity.google/docs/cli-overview"><kbd><img src="https://www.google.com/s2/favicons?domain=antigravity.google&sz=64" alt="Antigravity logo" width="16" valign="middle" /> Antigravity</kbd></a> &nbsp;
  <a href="https://pi.dev"><kbd><img src="https://pi.dev/favicon.svg" alt="Pi logo" width="16" valign="middle" /> Pi</kbd></a> &nbsp;
  <a href="https://omp.sh"><kbd><img src="https://omp.sh/favicon.svg" alt="oh-my-pi logo" width="16" valign="middle" /> oh-my-pi</kbd></a> &nbsp;
  <a href="https://hermes-agent.nousresearch.com/docs/"><kbd><img src="https://www.google.com/s2/favicons?domain=nousresearch.com&sz=64" alt="Hermes Agent logo" width="16" valign="middle" /> Hermes Agent</kbd></a> &nbsp;
  <a href="https://block.github.io/goose/docs/quickstart/"><kbd><img src="https://www.google.com/s2/favicons?domain=goose-docs.ai&sz=64" alt="Goose logo" width="16" valign="middle" /> Goose</kbd></a> &nbsp;
  <a href="https://docs.augmentcode.com/cli/overview"><kbd><img src="https://www.google.com/s2/favicons?domain=augmentcode.com&sz=64" alt="Auggie logo" width="16" valign="middle" /> Auggie</kbd></a> &nbsp;
  <a href="https://github.com/autohandai/code-cli"><kbd><img src="https://www.google.com/s2/favicons?domain=autohand.ai&sz=64" alt="Autohand Code logo" width="16" valign="middle" /> Autohand Code</kbd></a> &nbsp;
  <a href="https://github.com/charmbracelet/crush"><kbd><img src="https://www.google.com/s2/favicons?domain=charm.sh&sz=64" alt="Charm logo" width="16" valign="middle" /> Charm</kbd></a> &nbsp;
  <a href="https://docs.cline.bot/cline-cli/overview"><kbd><img src="https://www.google.com/s2/favicons?domain=cline.bot&sz=64" alt="Cline logo" width="16" valign="middle" /> Cline</kbd></a> &nbsp;
  <a href="https://www.codebuff.com/docs/help/quick-start"><kbd><img src="https://www.google.com/s2/favicons?domain=codebuff.com&sz=64" alt="Codebuff logo" width="16" valign="middle" /> Codebuff</kbd></a> &nbsp;
  <a href="https://commandcode.ai/docs/quickstart"><kbd><img src="https://www.google.com/s2/favicons?domain=commandcode.ai&sz=64" alt="Command Code logo" width="16" valign="middle" /> Command Code</kbd></a> &nbsp;
  <a href="https://docs.continue.dev/guides/cli"><kbd><img src="https://www.google.com/s2/favicons?domain=continue.dev&sz=64" alt="Continue logo" width="16" valign="middle" /> Continue</kbd></a> &nbsp;
  <a href="https://docs.factory.ai/cli/getting-started/quickstart"><kbd><img src="../assets/droid-logo.svg" alt="Droid logo" width="16" valign="middle" /> Droid</kbd></a> &nbsp;
  <a href="https://kilo.ai/docs/cli"><kbd><img src="https://raw.githubusercontent.com/Kilo-Org/kilocode/main/packages/kilo-vscode/assets/icons/kilo-light.svg" alt="Kilocode logo" width="16" valign="middle" /> Kilocode</kbd></a> &nbsp;
  <a href="https://www.kimi.com/code/docs/en/kimi-code-cli/getting-started.html"><kbd><img src="https://www.google.com/s2/favicons?domain=moonshot.cn&sz=64" alt="Kimi logo" width="16" valign="middle" /> Kimi</kbd></a> &nbsp;
  <a href="https://kiro.dev/docs/cli/"><kbd><img src="https://www.google.com/s2/favicons?domain=kiro.dev&sz=64" alt="Kiro logo" width="16" valign="middle" /> Kiro</kbd></a> &nbsp;
  <a href="https://github.com/mistralai/mistral-vibe"><kbd><img src="https://www.google.com/s2/favicons?domain=mistral.ai&sz=64" alt="Mistral Vibe logo" width="16" valign="middle" /> Mistral Vibe</kbd></a> &nbsp;
  <a href="https://github.com/QwenLM/qwen-code"><kbd><img src="https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=64" alt="Qwen Code logo" width="16" valign="middle" /> Qwen Code</kbd></a> &nbsp;
  <a href="https://support.atlassian.com/rovo/docs/install-and-run-rovo-dev-cli-on-your-device/"><kbd><img src="https://www.google.com/s2/favicons?domain=atlassian.com&sz=64" alt="Rovo Dev logo" width="16" valign="middle" /> Rovo Dev</kbd></a> &nbsp;
  <kbd>+ any CLI agent</kbd>
</p>

---

## Instalación

### Escritorio — macOS, Windows, Linux

- **[Descarga desde github.com/jakedomshoots/janus-code](https://github.com/jakedomshoots/janus-code/download)**
- O descarga un build directamente: [macOS Apple Silicon](https://github.com/jakedomshoots/janus-code/releases/latest/download/janus-code-macos-arm64.dmg) · [macOS Intel](https://github.com/jakedomshoots/janus-code/releases/latest/download/janus-code-macos-x64.dmg) · [Windows (.exe)](https://github.com/jakedomshoots/janus-code/releases/latest/download/janus-code-windows-setup.exe) · [Linux AppImage](https://github.com/jakedomshoots/janus-code/releases/latest/download/janus-code-linux.AppImage) · [Todos los builds](https://github.com/jakedomshoots/janus-code/releases/latest)

_O mediante un gestor de paquetes:_

```bash
# macOS (Homebrew)
brew install --cask jakedomshoots/janus-code/orca

# Arch Linux (AUR) — or stably-orca-git to build from source
yay -S stably-orca-bin
```

### App companion móvil — iOS, Android

Vincúlala con tu app de escritorio para supervisar y dirigir a tus agentes desde el teléfono.

- **iOS:** [Descargar desde App Store](https://apps.apple.com/us/app/janus-code/id6766130217)
- **Android:** [Descargar el APK](https://github.com/jakedomshoots/janus-code/releases/download/mobile-v0.0.13/app-release.apk)

---

## Comunidad y soporte

- **Feedback e ideas:** Lanzamos rápido. ¿Te falta algo? [Pide una nueva feature](https://github.com/jakedomshoots/janus-code/issues).
- **Privacidad:** Consulta la [documentación de privacidad y telemetría](https://github.com/jakedomshoots/janus-code/tree/main/docs) para saber qué datos anónimos de uso recopila Janus Code y cómo desactivar su envío.
- **Muéstranos tu apoyo:** Dale una [estrella](https://github.com/jakedomshoots/janus-code) a este repo para seguir nuestros lanzamientos diarios.

---

## Desarrollo

¿Quieres contribuir o ejecutar Janus Code localmente? Consulta nuestra guía [CONTRIBUTING.md](../../.github/CONTRIBUTING.md).

<a href="https://github.com/jakedomshoots/janus-code/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jakedomshoots/janus-code" alt="Contribuidores de Janus Code" />
</a>

## Licencia

Janus Code es libre y de código abierto bajo la [Licencia MIT](../../LICENSE).
