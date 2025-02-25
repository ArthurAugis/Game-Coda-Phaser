import { Scene } from 'phaser';
import {Bullet} from "../entities/Bullet.ts";
import {GroupUtils} from "../utils/GroupUtils.ts";
import {Player} from "../entities/Player.ts";
import {Enemy} from "../entities/Enemy.ts";
import {GameDataKeys} from "../Data/GameDataKeys.ts";

export class MainGameScene extends Scene
{

    private player: Phaser.GameObjects.Image;
    private bullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemies_bullets: Phaser.Physics.Arcade.Group;
    private bg: Phaser.GameObjects.TileSprite
    private sprites: Phaser.GameObjects.TileSprite
    private playerShipData: PlayerShipData;
    private godmode: boolean = false;


    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('background', 'Backgrounds/darkPurple.png');
        this.load.image('meteor', 'PNG/Meteors/meteorBrown_big1.png');
        this.load.atlas('sprites', 'texture.png', 'texture.json');
        this.load.audio('laser_Enemy', 'Bonus/sfx_laser1.ogg');
        this.load.audio('laser_Player', 'Bonus/sfx_laser2.ogg');
        this.load.json('playerShips', 'Data/playerShips.json');
    }

    create ()
    {
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData["1"];

        this.registry.set<number>(GameDataKeys.PlayerScore, 0);

        this.registry.events.on('changedata-' + GameDataKeys.PlayerScore, (_: any, value: number) => {
            score_text.setText(`Score:${value}`);
        });

        this.cameras.main.setBackgroundColor(0x50514f);
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background').setOrigin(0).setTileScale(2);

        this.anims.create({
            key: 'ufoshoot',
            frames: [
                {key: 'sprites', frame: 'ufoRed.png'},
                {key: 'sprites', frame: 'enemy_2.png'},
                {key: 'sprites', frame: 'enemy_3.png'},
            ],
            frameRate: 4,
        })

        this.bullets = this.physics.add.group({
            classType: Bullet,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            },
            maxSize: 500,
            runChildUpdate: true
        })
        GroupUtils.preallocateGroup(this.bullets, 100);
        this.enemies_bullets = this.physics.add.group({
            classType: Bullet,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            },
            maxSize: 500,
            runChildUpdate: true
        });
        GroupUtils.preallocateGroup(this.enemies_bullets, 100);

        this.enemies = this.physics.add.group({
            classType: Enemy,
            defaultKey: 'sprites',
            defaultFrame: 'ufoRed.png',
            createCallback: (enemy) => {
                (enemy as Enemy).init(this.enemies_bullets);
            },
            maxSize: 500,
            runChildUpdate: true
        });
        GroupUtils.preallocateGroup(this.enemies, 100);

        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.height - 128, 'sprites', this.playerShipData.texture, this.bullets);
        this.physics.add.existing(this.player);

        const score_text = this.add.text(this.cameras.main.centerX, 64, 'Score:0', { font: '48px Arial', color: '#ffffff', align: 'center', backgroundColor: '#000000' }).setOrigin(0.5);


        this.physics.add.collider(this.bullets, this.enemies,(bullet, enemy) => {
            (bullet as Bullet).disable();
            (enemy as Enemy).disable();
            this.registry.inc(GameDataKeys.PlayerScore, 1);
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            (enemy as Enemy).disable();
            if(!this.godmode) {
                player.destroy();
                this.scene.start('GameOverScene');
            } else {
                player.removeVelocity();
                this.registry.inc(GameDataKeys.PlayerScore, 1);
            }
        });

        this.physics.add.collider(this.player, this.enemies_bullets, (player, enemy_bullet) => {
            (enemy_bullet as Bullet).disable();
            if(!this.godmode) {
                player.destroy();
                this.scene.start('GameOverScene');
            } else {
                player.removeVelocity();
            }
        });

        this.physics.add.collider(this.bullets, this.enemies_bullets, (bullet, enemy_bullet) => {
            (bullet as Bullet).disable();
            (enemy_bullet as Bullet).disable();
        })

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })


    }

    private spawnEnemy() {
        if(this.enemies.countActive() >= 10) { return; }
        let enemy = this.enemies.get() as Enemy;
        if(enemy) {
            enemy.enable(Phaser.Math.Between(32, this.cameras.main.width - 32), -32);
        }
    }


    update(_timestamp: number, _delta: number) {

        this.bg.tilePositionY -= 0.1 * _delta;

        (this.player as Player).update(_timestamp, _delta);

        this.bullets.getChildren().forEach(bullet => {
            if((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                bullet.destroy();
            }
        });

        this.enemies.getChildren().forEach(enemy => {
            if((enemy as Phaser.GameObjects.Rectangle).y >= this.cameras.main.height + (enemy as Phaser.GameObjects.Arc).displayHeight) {
                enemy.destroy();
            }
        });

        this.enemies_bullets.getChildren().forEach(enemy_bullet => {
            if((enemy_bullet as Phaser.GameObjects.Rectangle).y >= this.cameras.main.height + (enemy_bullet as Phaser.GameObjects.Arc).displayHeight) {
                enemy_bullet.destroy();
            }
        });

        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth / 2, this.cameras.main.width - this.player.displayWidth/2)
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.displayHeight / 2, this.cameras.main.height - this.player.displayHeight/2)
    }
}
