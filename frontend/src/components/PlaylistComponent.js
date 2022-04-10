import React, { useState } from 'react';

import Song from './Song';

const Playlist = () => {
  const [tracks, setTracks] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPlayer = () => {
    setLoading(true);
    fetch(`/spotify/get-player`)
      .then(response => response.json())
      .then(player => {
        console.log(player.tracks)
        setTracks(player.tracks);
        setLoading(false);
      });
  }


  return (
    <div>
      <div>{loading ? 'loading...' : 'idk what'}</div>
      <div className='playlist'>{tracks === null ? 'playlist' : tracks.map((track, index) => (
            <Song
              key={index}
              name={track.track.name}
            />
          ))}</div>
      <div><button onClick={getPlayer} >Click</button></div>
    </div>
  );
}

export default Playlist;