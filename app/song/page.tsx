'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { sysRequest } from '../api/fetch';
import { Button, Input } from '@headlessui/react';
interface SongData {
  id: number;
  mid: string;
  song: string;
  cover: string;
  singer: string;
  album: string;
}

interface SongInfo {
  url: string;
}

export default function SongPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [SongInfo, setSongInfo] = useState<SongInfo>();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});
  const [isPaused, setIsPaused] = useState<{ [key: number]: boolean }>({});

  const handleTimeUpdate = (audioElement: HTMLAudioElement) => {
    setProgress(audioElement.currentTime);
    setDuration(audioElement.duration);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await sysRequest.get('/api/song', {
        params: {
          word: searchTerm,
        },
      });
      setSongs(res.data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (song: SongData, n = 1) => {
    if (playingId === song.id) {
      const audio = audioRefs.current[song.id];
      if (audio.paused) {
        audio.play();
        setIsPaused(prev => ({ ...prev, [song.id]: false }));
      } else {
        audio.pause();
        setIsPaused(prev => ({ ...prev, [song.id]: true }));
      }
      return;
    }

    const res = await sysRequest.get('/api/song/download', {
      params: { word: searchTerm, n },
    });

    setSongInfo(res.data);
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause();
      setIsPaused(prev => ({ ...prev, [playingId]: true }));
    }
    
    const audio = audioRefs.current[song.id];
    if (audio) {
      audio.play();
      setPlayingId(song.id);
      setIsPaused(prev => ({ ...prev, [song.id]: false }));
    }
  };

  const handleProgressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    songId: number
  ) => {
    const audio = audioRefs.current[songId];
    if (audio) {
      const newTime = Number(e.target.value);
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-8">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for songs..."
          className="flex-1 p-2 border rounded"
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded  disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song, i) => (
          <div
            key={song.id}
            className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
          >
            <div className="relative w-full aspect-square mb-4 group">
              <Image
                src={song.cover}
                alt={song.song}
                fill
                className="object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handlePlay(song, i + 1)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black p-3 rounded-full hover:bg-gray-100"
                >
                  {playingId === song.id && !isPaused[song.id] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <audio
              ref={(el) => {
                if (el) audioRefs.current[song.id] = el;
              }}
              id={`audio-${song.id}`}
              src={SongInfo?.url}
              onEnded={() => setPlayingId(null)}
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget)}
            />
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={playingId === song.id ? progress : 0}
                onChange={(e) => handleProgressChange(e, song.id)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {playingId === song.id
                    ? `${Math.floor(progress / 60)}:${String(
                        Math.floor(progress % 60)
                      ).padStart(2, '0')}`
                    : '0:00'}
                </span>
                <span>
                  {playingId === song.id
                    ? `${Math.floor(duration / 60)}:${String(
                        Math.floor(duration % 60)
                      ).padStart(2, '0')}`
                    : '0:00'}
                </span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1 truncate">{song.song}</h3>
            <p className="text-gray-600 mb-2 truncate">{song.singer}</p>
            <p className="text-gray-500 text-sm mb-4 truncate">{song.album}</p>
            <button
              onClick={() => window.open(SongInfo?.url)}
              className="w-full bg-[var(--primary)] text-white py-2 rounded  transition-colors duration-300"
            >
              下载
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
