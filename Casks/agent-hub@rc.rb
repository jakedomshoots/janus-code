cask "agent-hub@rc" do
  arch arm: "arm64", intel: "x64"

  version "1.4.36-rc.3"
  sha256 arm:   "563b6b14323fc9d5489299c82442d514bc12cabffc9d06d3964ed572af4b3955",
         intel: "457088c7021f07de1a419197f7b2bd00092741ad4727d4fef3d86af38a6831e7"

  url "https://github.com/jakedom/agent-hub/releases/download/v#{version}/agent-hub-macos-#{arch}.dmg",
      verified: "github.com/jakedom/agent-hub/"
  name "Agent Hub RC"
  desc "GUI-first desktop workspace for CLI coding agents"
  homepage "https://github.com/jakedom/agent-hub"

  livecheck do
    url "https://github.com/jakedom/agent-hub"
    regex(/^v?(\d+(?:\.\d+)+-rc\.\d+)$/i)
    strategy :github_releases do |json, regex|
      json.map do |release|
        next if release["draft"]
        next unless release["prerelease"]

        match = release["tag_name"]&.match(regex)
        next if match.blank?

        match[1]
      end
    end
  end

  auto_updates true
  conflicts_with cask: "agent-hub"
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
