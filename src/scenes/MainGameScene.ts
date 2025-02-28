import { Scene } from 'phaser';
import {Bullet} from "../entities/Bullet.ts";
import {GroupUtils} from "../utils/GroupUtils.ts";
import {Player} from "../entities/Player.ts";
import {Enemy} from "../entities/Enemy.ts";
import {GameDataKeys} from "../Data/GameDataKeys.ts";
import {Health} from "../components/Health.ts";
import { PowerUp } from "../entities/PowerUp.ts";
import {Boss} from "../entities/Boss.ts";
import {Movement} from "../components/Movement.ts";

export class MainGameScene extends Scene
{

    private player: Phaser.GameObjects.Image;
    private bullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private bosses: Phaser.Physics.Arcade.Group;
    private enemies_bullets: Phaser.Physics.Arcade.Group;
    private bg: Phaser.GameObjects.TileSprite
    private sprites: Phaser.GameObjects.TileSprite
    private playerShipData: PlayerShipData;
    private godmode: boolean = false;
    private score_text: Phaser.GameObjects.Text;
    private powerUps: Phaser.Physics.Arcade.Group;
    private level: number = 0;
    private spawnRate: number = 1500;
    private bossLevel: number = 10;


    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '40px monospace',
                color: '#ffffff',
                align: 'center'
            }
        }).setOrigin(0.5);
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
            loadingText.setText('Loading...' + Math.round(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    create ()
    {
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData["1"];

        this.registry.set<number>(GameDataKeys.PlayerScore, 0);

        this.level = this.registry.get(GameDataKeys.PlayerScore) / 10 + 1;

        this.score_text = this.add.text(this.cameras.main.centerX, 64, `Score:${this.registry.get(GameDataKeys.PlayerScore)} | Level:${this.level}`, { font: '48px Arial', color: '#ffffff', align: 'center', backgroundColor: '#000000' }).setOrigin(0.5).setDepth(1000);

        this.registry.events.on('changedata-' + GameDataKeys.PlayerScore, (_: any, value: number) => {

            if(this.registry.get(GameDataKeys.PlayerScore) === 0) return;

            if(this.level % this.bossLevel === 0) {
                this.score_text.setText(`Score:${value} | Level:${this.level} | Boss Level`);
            } else {
                this.score_text.setText(`Score:${value} | Level:${this.level}`);
            }
        });


        this.cameras.main.setBackgroundColor(0x50514f);
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background').setOrigin(0).setTileScale(2);

        this.anims.create({
            key: 'ufoshoot',
            frames: [
                {key: 'sprites', frame: 'ufoRed.png'},
                {key: 'sprites', frame: 'enemy_3.png'},
                {key: 'sprites', frame: 'enemy_2.png'},
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

        this.bosses = this.physics.add.group({
            classType: Boss,
            defaultKey: 'sprites',
            defaultFrame: 'boss.png',
            createCallback: (boss) => {
                (boss as Boss).init(this.enemies_bullets);
            },
            maxSize: 500,
            runChildUpdate: true
        });
        GroupUtils.preallocateGroup(this.bosses, 5);

        this.powerUps = this.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true
        });

        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.height - 128, 'sprites', this.playerShipData.texture, this.bullets);
        this.physics.add.existing(this.player);

        this.physics.add.overlap(this.bullets, this.enemies,(bullet, enemy) => {
            (bullet as Bullet).disable();
            (enemy as Enemy).getComponent(Health)?.inc(-1);
            const ennemyHealth = (enemy as Enemy).getComponent(Health);
            if (ennemyHealth && ennemyHealth.getValue() <= 1) {
                (enemy as Enemy).getComponent(Health)?.once('death', () => {
                    (enemy as Enemy).scene.registry.inc(GameDataKeys.PlayerScore, 1);
                    (enemy as Enemy).dropPowerUp();
                });
            }
        });

        this.physics.add.overlap(this.bullets, this.bosses,(bullet, boss) => {
            if(this.registry.get(GameDataKeys.BossIsSpawned) === true) {
                (boss as Boss).getComponent(Health)?.inc(-1);
                const bossHealth = (boss as Boss).getComponent(Health);
                if (bossHealth && bossHealth.getValue() <= 1) {
                    (boss as Boss).getComponent(Health)?.on('death', () => {
                        (boss as Boss).getComponent(Movement)?.setSpeed(0.2);
                        (boss as Boss).scene.registry.inc(GameDataKeys.PlayerScore, 11);
                        this.level = Math.floor(this.registry.get(GameDataKeys.PlayerScore) / 10 + 1);
                        this.registry.set(GameDataKeys.BossIsSpawned, false);
                        (boss as Boss).dropPowerUp();
                    });
                }
            }

            (bullet as Bullet).disable();
        });

        this.physics.add.overlap(this.player, this.bosses, (player, boss) => {
            if(!this.godmode) {
                (player as Player).getComponent(Health)?.inc(-1);
                (player as Player).getComponent(Health)?.once('death', () => {
                    this.scene.start('GameOverScene');
                });
            }
        });

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if(!this.godmode) {
                (player as Player).getComponent(Health)?.inc(-1);
                (player as Player).getComponent(Health)?.once('death', () => {
                    this.scene.start('GameOverScene');
                });
            }
        });

        this.physics.add.overlap(this.player, this.enemies_bullets, (player, enemy_bullet) => {
            (enemy_bullet as Bullet).disable();
            if(!this.godmode) {
                (player as Player).getComponent(Health)?.inc(-1);
                (player as Player).getComponent(Health)?.once('death', () => {
                    this.scene.start('GameOverScene');
                });
            }
        });

        this.physics.add.collider(this.bullets, this.enemies_bullets, (bullet, enemy_bullet) => {
            (bullet as Bullet).disable();
            (enemy_bullet as Bullet).disable();
        });

        this.physics.add.collider(this.player, this.powerUps, (player, powerUp) => {
            (powerUp as PowerUp).applyEffect(player as Player);
        });



        this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    private spawnEnemy() {
        if (this.enemies.countActive() >= 10) { return; }
        if (this.bosses.countActive() >= 1) { return; }
        if(this.level % this.bossLevel !== 0) {
            let enemy = this.enemies.get() as Enemy;
            if (enemy) {
                enemy.enable(Phaser.Math.Between(32, this.cameras.main.width - 32), -32);
                enemy.getComponent(Health)?.set(2);
            }
        } else if(this.enemies.countActive() === 0) {
            let boss = this.bosses.get() as Boss;
            if (boss) {
                boss.enable(this.cameras.main.centerX, -32);
                boss.getComponent(Health)?.set(10);
            }
        }
    }

    public addPowerUpToList(powerUp: PowerUp) {
        this.powerUps.add(powerUp);
    }

    update(_timestamp: number, _delta: number) {
        const score = this.registry.get(GameDataKeys.PlayerScore);
        const newLevel = Math.floor(score / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.spawnRate = this.spawnRate + Phaser.Math.Between(-75, -25);
            this.time.removeAllEvents();
            this.time.addEvent({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }

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

        this.bosses.getChildren().forEach(boss => {
            if((boss as Phaser.GameObjects.Rectangle).y >= this.cameras.main.height + (boss as Phaser.GameObjects.Arc).displayHeight) {
                boss.destroy();
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
