import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import Info from './Info';

import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null
        };
        this.clearRoomCode = this.clearRoomCode.bind(this);
    }

    componentDidMount() {
        fetch('/api/user-in-room')
        .then((response) => response.json())
        .then((data) => {
            this.setState({
                roomCode: data.code
            });
        });
    }

    clearRoomCode() {
        this.setState({
            roomCode: null,
        })
    }

    render() {

        const RoomWrapper = (props) => {
            const params = useParams();
            const history = useNavigate();
            return <Room {...{...props, history, match: {params}} } leaveRoomCallBack={this.clearRoomCode} />;
        }

        const CreateRoomWrapper = (props) => {
            const history = useNavigate();
            return <CreateRoomPage {...{...props, history }} />;
        }

        const RoomJoinWrapper = (props) => {
            const history = useNavigate();
            return <RoomJoinPage {...{...props, history }} />;
        }

        const RenderHomePage = () => {
            return (
                <Grid container spacing={3}>
                    <Grid item xs={12} align='center'>
                        <Typography variant='h3' compact='h3'>
                            Party Tunes
                        </Typography>
                    </Grid>
                    <Grid item xs={12} align='center'>
                        <ButtonGroup disableElevation variant='contained' color='primary'>
                            <Button color='primary' to='/join' component={ Link }>Join a room</Button>
                            <Button color='default' to='/info' component={ Link }>Info</Button>
                            <Button color='secondary' to='/create-room' component={ Link }>Create a room</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            );
        }

        const RenderHomePageWrapper = () => {
            return (
                this.state.roomCode ? (
                    <Navigate replace to={`/room/${this.state.roomCode}`} />
                ) : (
                    <RenderHomePage />
                )
            );
        }

        return (
            <Router>
                <Routes>
                    <Route exact path="/" element={<RenderHomePageWrapper />} />
                    <Route path="/join" element={<RoomJoinWrapper />} />
                    <Route path="/info" element={<Info />} />
                    <Route path="/create-room" element={<CreateRoomWrapper />} />
                    <Route path="/room/:roomCode" element={<RoomWrapper />} />
                </Routes>
            </Router>
        );
    }
}