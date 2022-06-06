import React, { useState, useEffect } from 'react';

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import Box from '@mui/material/Box';


const Playlist = (props) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      getPlayer();
  }, [props.id]);

  const getPlayer = () => {
    setLoading(true);
    fetch(`/spotify/get-player`)
      .then(response => response.json())
      .then(player => {
        setTracks(player.tracks);
        setLoading(false);
      });
  }

  const playSong = (id) => {
    console.log("THIS WILL PLAY!", id)
  }

  return (
    <Box sx={{ width: '90%', maxWidth: "900px", height: 400}} >
      <List style={{maxHeight: '100%', overflow: 'auto'}}>

        {tracks.map(track => (
          <ListItem key={track.id} button onClick={() => playSong(track.id)} >
            <ListItemIcon>
              <PlayCircleOutlinedIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={track.name} secondary={track.artist}/>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Playlist;