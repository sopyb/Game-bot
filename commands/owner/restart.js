function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const { spawn } = require("child_process");

module.exports = {
  name: "restart",
  run: async function (message, args) {
    if (!client.config.ownerID.includes(message.author.id)) {
      return message.channel.send(
        "You might be a high level wizzard but you can't still use this spell."
      );
    }

    await message.channel.send("Restarting...");

    console.clear();
    console.log("Restarting...");
    client.destroy();

    (function main() {
      // Restart process ...
      spawn(process.argv0, process.argv.slice(1), {
        detached: true,
        stdio: "inherit",
        cwd: process.cwd(),
      }).unref();
      process.exit(0);
    })();
  },
};
