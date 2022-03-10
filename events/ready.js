const { colors, format, reset } = require("../utils/clformat");

function changeStatus() {
  const random = Math.floor(
    Math.random() * (client.config.activity.length - 1)
  );
  const status = client.config.activity[random];

  client.user.setActivity(status.text, { type: status.type });
}

client.on("ready", () => {
  const user = client.user;
  console.log(
    `${colors.blue}Info:${reset}  Logged in as ${colors.green}${
      user.tag
    }${reset} at ${colors.green}${new Date()
      .toUTCString()
      .split(", ")[1]
      .replace("GMT", "UTC")}${reset}`
  );
  changeStatus();
  setInterval(changeStatus, 30000);
});

module.exports = {
  name: "ready",
};
