
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface AppHeaderProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  randomMode,
  setRandomMode,
  volume,
  setVolume
}) => {
  const { theme } = useTheme();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Get audio player state - this is now the ONLY player in the app
  const {
    currentTrack,
    isPlaying,
    loading,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume: setPlayerVolume
  } = useAudioPlayer();

  // Sync volume between header state and player
  useEffect(() => {
    setPlayerVolume(volume);
  }, [volume, setPlayerVolume]);

  // CRITICAL FIX: Enhanced next/previous functions that respect random mode
  const handleNext = () => {
    console.log("Header: Next track clicked with random mode:", randomMode);
    nextTrack(); // This already uses enhanced handlers with random mode
  };

  const handlePrevious = () => {
    console.log("Header: Previous track clicked with random mode:", randomMode);
    previousTrack(); // This already uses enhanced handlers with random mode
  };

  // Determine which logo to use based on theme with preload
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme === "light"
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png"
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };

  // Preload both theme logos for instant switching
  useEffect(() => {
    const lightLogo = new window.Image();
    lightLogo.src = "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png";
    lightLogo.onload = () => setLogoLoaded(true);

    const darkLogo = new window.Image();
    darkLogo.src = "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
    darkLogo.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-surface-container/95 backdrop-blur-lg border-b border-outline-variant/20 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-1">
      <div className="container mx-auto flex items-center h-full px-4 gap-4 w-full">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={getLogoSrc()}
            alt="uRadio"
            className={`h-12 w-auto object-contain transition-opacity duration-100 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        
        {/* Main Info/Controls - THIS IS THE ONLY PLAYER IN THE APP */}
        <div className="flex flex-1 min-w-0 items-center">
          {currentTrack ? (
            <div className="flex items-center w-full gap-2 sm:gap-3">
              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base font-bold truncate text-on-surface"
                  title={currentTrack.name}
                >
                  {currentTrack.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {loading && (
                    <p className="text-xs text-primary animate-pulse">Loading...</p>
                  )}
                  {currentTrack.language && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-medium">
                      {currentTrack.language}
                    </span>
                  )}
                  {randomMode && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-secondary/20 text-secondary-foreground rounded-full font-medium">
                      Random
                    </span>
                  )}
                </div>
              </div>
              {/* Compact Controls */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <MusicPlayer
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={togglePlayPause}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  volume={volume}
                  onVolumeChange={setVolume}
                  loading={loading}
                  compact={true}
                />
                {/* Random Mode Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRandomMode(!randomMode)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-200",
                    randomMode
                      ? "bg-primary/20 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                  title={randomMode ? "Random mode on" : "Random mode off"}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-on-surface-variant truncate">
                  Select a station to start playing
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <MusicPlayer
                  currentTrack={null}
                  isPlaying={false}
                  onPlayPause={() => {}}
                  onNext={() => {}}
                  onPrevious={() => {}}
                  volume={volume}
                  onVolumeChange={setVolume}
                  loading={false}
                  compact={true}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRandomMode(!randomMode)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-200",
                    randomMode
                      ? "bg-primary/20 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  title={randomMode ? "Random mode on" : "Random mode off"}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
