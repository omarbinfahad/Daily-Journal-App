import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

class AudioPlayer {
  private sound: Sound | null = null;
  private nextSound: Sound | null = null;
  private nextSoundUri: string | null = null;
  private isPlaying = false;

  constructor() {
    void this.configureAudioMode();
  }

  private async configureAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  }

  async preloadSound(uri: string): Promise<void> {
    try {
      if (!uri) return;

      if (this.nextSound && this.nextSoundUri === uri) {
        return;
      }

      if (this.nextSound) {
        await this.nextSound.unloadAsync();
        this.nextSound = null;
        this.nextSoundUri = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      this.nextSound = sound;
      this.nextSoundUri = uri;
    } catch (error) {
      console.error('Error preloading sound:', error);
    }
  }

  async playSound(uri: string): Promise<void> {
    try {
      if (!uri) return;

      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      if (this.nextSound && this.nextSoundUri === uri) {
        this.sound = this.nextSound;
        this.nextSound = null;
        this.nextSoundUri = null;
        this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
        await this.sound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          this.onPlaybackStatusUpdate
        );
        this.sound = sound;
      }

      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      this.isPlaying = false;
      void this.unloadSound();
    }
  };

  async stopSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  async unloadSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup(): Promise<void> {
    await this.unloadSound();
    if (this.nextSound) {
      await this.nextSound.unloadAsync();
      this.nextSound = null;
      this.nextSoundUri = null;
    }
  }
}

export const audioPlayer = new AudioPlayer();
