cask "janus-code@rc" do
  arch arm: "arm64", intel: "x64"

  version "1.4.36-rc.3"
  sha256 arm:   "563b6b14323fc9d5489299c82442d514bc12cabffc9d06d3964ed572af4b3955",
         intel: "457088c7021f07de1a419197f7b2bd00092741ad4727d4fef3d86af38a6831e7"

  url "https://github.com/jakedomshoots/janus-code/releases/download/v#{version}/janus-code-macos-#{arch}.dmg",
      verified: "github.com/jakedomshoots/janus-code/"
  name "Janus Code RC"
  desc "GUI-first desktop workspace for CLI coding agents"
  homepage "https://github.com/jakedomshoots/janus-code"

  livecheck do
    url "https://github.com/jakedomshoots/janus-code"
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
  conflicts_with cask: "janus-code"
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
