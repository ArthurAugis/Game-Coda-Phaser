import { MainGameScene as MainGame } from './scenes/MainGameScene.ts';
import { AUTO, Game, Scale,Types } from 'phaser';
import {MainMenuScene} from "./scenes/MainMenuScene.ts";
import {GameOverScene} from "./scenes/GameOverScene.ts";
import {LeaderBoard} from "./scenes/LeaderBoard.ts";

//  Find out more information about the MainGameScene Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 1920,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    audio : {
        noAudio : false,
    },
    input: {
        gamepad: true,
        keyboard: true,
        mouse: true,
        touch: true,
    },
    fps: { forceSetTimeOut: true, target: 120 },
    scene: [
        MainMenuScene,
        MainGame,
        GameOverScene,
        LeaderBoard
    ]
};

export default new Game(config);
