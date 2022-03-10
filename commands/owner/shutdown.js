module.exports = {
  name: "shutdown",
  run: async function (message, args) {
    if (!client.config.ownerID.includes(message.author.id)) {
      return message.channel.send(
        "You might be a high level wizzard but you can't still use this spell."
      );
    }
    await message.channel.send("Shutting down...");
    process.exit();
  },
};
