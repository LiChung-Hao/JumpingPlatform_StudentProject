import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('platform', 'assets/pipe.png');
    this.load.image('pause', 'assets/pause.png');
    this.load.image('back', 'assets/back.png');
    this.load.spritesheet('dude_right', 'assets/firen_0-removebg-preview.png', {
      frameWidth: 60,
      frameHeight: 60,
    });
    this.load.spritesheet(
      'dude_left',
      'assets/firen_0_mirror-removebg-preview.png',
      {
        frameWidth: 60,
        frameHeight: 60,
      }
    );
  }

  create() {
    this.scene.start('MenuScene');
  }
}

export default PreloadScene;
