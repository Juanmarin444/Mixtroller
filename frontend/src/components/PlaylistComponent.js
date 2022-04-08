import React, { useState } from 'react';

const Playlist = () => {
  const [songs, setsongs] = useState(null);
  const [loading, setLoading] = useState(false);
  const getSongs = () => {
    setLoading(true);
    fetch(`/spotify/get-player`)
      .then(response => response.json())
      .then(songs => {
        setsongs(songs);
        setLoading(false);
      });
    console.log(songs)
  }
  return (
    <div>
      <div>{loading ? 'loading...' : 'idk what'}</div>
      <div>{songs != null ? songs.tracks[0].name : 'Playlist'}</div>
      <div><button onClick={getSongs} >Click</button></div>
    </div>
  );
}

export default Playlist;