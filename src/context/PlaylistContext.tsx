
import React, { createContext, useContext, useState, useEffect } from "react";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";

export interface PlaylistTrack extends Track {
  addedToPlaylistAt: number;
}

interface PlaylistContextType {
  playlistTracks: PlaylistTrack[];
  addToPlaylist: (track: Track) => boolean;
  removeFromPlaylist: (trackUrl: string) => boolean;
  clearPlaylist: () => number;
  isInPlaylist: (trackUrl: string) => boolean;
  getPlaylistTrack: (trackUrl: string) => PlaylistTrack | undefined;
  playlistCount: number;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const PLAYLIST_STORAGE_KEY = 'uradio_playlist';

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);

  // Load playlist from localStorage on init
  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (savedPlaylist) {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylistTracks(parsed);
        logger.debug("Loaded playlist from storage", { count: parsed.length });
      }
    } catch (error) {
      logger.error("Error loading playlist from storage", error);
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistTracks));
      logger.debug("Saved playlist to storage", { count: playlistTracks.length });
    } catch (error) {
      logger.error("Error saving playlist to storage", error);
    }
  }, [playlistTracks]);

  const addToPlaylist = (track: Track): boolean => {
    // Check for duplicates
    const exists = playlistTracks.some(t => 
      t.url.toLowerCase().trim() === track.url.toLowerCase().trim()
    );
    
    if (exists) {
      logger.warn("Track already in playlist", { url: track.url, name: track.name });
      return false;
    }

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedToPlaylistAt: Date.now()
    };

    setPlaylistTracks(prev => [...prev, playlistTrack]);
    logger.info("Added track to playlist", { name: track.name });
    return true;
  };

  const removeFromPlaylist = (trackUrl: string): boolean => {
    const exists = playlistTracks.some(t => t.url === trackUrl);
    if (!exists) {
      logger.warn("Track not found in playlist", { url: trackUrl });
      return false;
    }

    setPlaylistTracks(prev => prev.filter(t => t.url !== trackUrl));
    logger.info("Removed track from playlist", { url: trackUrl });
    return true;
  };

  const clearPlaylist = (): number => {
    const count = playlistTracks.length;
    setPlaylistTracks([]);
    logger.info("Cleared playlist", { removedCount: count });
    return count;
  };

  const isInPlaylist = (trackUrl: string): boolean => {
    return playlistTracks.some(t => t.url === trackUrl);
  };

  const getPlaylistTrack = (trackUrl: string): PlaylistTrack | undefined => {
    return playlistTracks.find(t => t.url === trackUrl);
  };

  const contextValue: PlaylistContextType = {
    playlistTracks,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
    getPlaylistTrack,
    playlistCount: playlistTracks.length
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
