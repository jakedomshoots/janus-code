cask "agent-hub" do
  arch arm: "arm64", intel: "x64"

  version "1.3.24"
  sha256 arm:   "fc707f290ff3b631b7b7947bf339885b61a43d2e89475997c125b61268ed4966",
         intel: "5f677c13a08f7a5740442e29d388285a86488c8c1f7aa5f10a8721a2c6ede8e4"

  url "https://github.com/jakedomshoots/agent-hub/releases/download/v#{version}/agent-hub-macos-#{arch}.dmg",
      verified: "github.com/jakedomshoots/agent-hub/"
  name "Agent Hub"
  desc "GUI-first desktop workspace for CLI coding agents"
  homepage "https://github.com/jakedomshoots/agent-hub"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  conflicts_with cask: "agent-hub@rc"
  depends_on macos: :big_sur

  app "Agent Hub.app"

  zap trash: [
    "~/.agent-hub",
    "~/Library/Application Support/Agent Hub",
    "~/Library/Caches/com.jakedom.agenthub",
    "~/Library/Caches/com.jakedom.agenthub.ShipIt",
    "~/Library/HTTPStorages/com.jakedom.agenthub",
    "~/Library/Preferences/com.jakedom.agenthub.plist",
    "~/Library/Saved Application State/com.jakedom.agenthub.savedState",
  ]
end
