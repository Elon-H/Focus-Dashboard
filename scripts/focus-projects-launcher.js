function shellQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function run() {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  const projectDir = "__PROJECT_DIR__";
  const launcher = `${projectDir}/scripts/launch-focus-projects.sh`;
  const command = `/bin/zsh ${shellQuote(launcher)} --background`;

  try {
    app.doShellScript(command);
  } catch (error) {
    app.displayDialog(String(error), {
      buttons: ["OK"],
      defaultButton: "OK",
    });
  }
}
