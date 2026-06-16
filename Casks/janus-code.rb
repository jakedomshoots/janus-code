cask "janus-code" do
  arch arm: "arm64", intel: "x64"

  version "1.3.24"
  sha256 arm:   "fc707f290ff3b631b7b7947bf339885b61a43d2e89475997c125b61268ed4966",
         intel: "5f677c13a08f7a5740442e29d388285a86488c8c1f7aa5f10a8721a2c6ede8e4"

  url "https://github.com/jakedomshoots/janus-code/releases/download/v#{version}/janus-code-macos-#{arch}.dmg",
      verified: "github.com/jakedomshoots/janus-code/"
  name "Janus Code"
  desc "GUI-first desktop workspace for CLI coding agents"
  homepage "https://github.com/jakedomshoots/janus-code"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  conflicts_with cask: "janus-code@rc"
  depends_on macos: :big_sur

  app "Janus Code.app"

  zap trash: [
    "~/.janus-code",
    "~/.agent-hub",
    "~/Library/Application Support/Janus Code",
    "~/Library/Caches/com.jakedom.januscode",
    "~/Library/Caches/com.jakedom.januscode.ShipIt",
    "~/Library/Caches/com.jakedom.agenthub",
    "~/Library/Caches/com.jakedom.agenthub.ShipIt",
    "~/Library/HTTPStorages/com.jakedom.januscode",
    "~/Library/HTTPStorages/com.jakedom.agenthub",
    "~/Library/Preferences/com.jakedom.januscode.plist",
    "~/Library/Preferences/com.jakedom.agenthub.plist",
    "~/Library/Saved Application State/com.jakedom.januscode.savedState",
    "~/Library/Saved Application State/com.jakedom.agenthub.savedState",
  ]
end
