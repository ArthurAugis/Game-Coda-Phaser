export class MainMenuScene extends Phaser.Scene {
  
  
  constructor() {
    super("MainMenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        "Main Menu Scene",
        { color: "#ffffff", fontSize: "64px" }
      )
      .setOrigin(0.5);
      const gamepad = this.input.gamepad?.getPad(0)
      let restartText = ""
      if (gamepad) {
          let buttonName = "A (Xbox)"
          restartText = ` or ${buttonName}`
      }

    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 50,
        `Press SPACE${restartText}`,
        { color: "#ffffff", fontSize: "32px" }
      )
      .setOrigin(0.5);

    this.input.keyboard?.on("keydown-SPACE", () => {
      this.scene.start("MainGameScene");
    });

    this.input.gamepad?.on("down", (pad, button, index) => {
        console.log("button", button.index);
        if (button.index === 0) {
            this.scene.start("MainGameScene");
        }
    });
  }  
}
