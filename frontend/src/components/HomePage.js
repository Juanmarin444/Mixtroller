import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, Redirect } from 'react-router-dom';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const RoomWrapper = (props) => {
            const params = useParams();
            return <Room {...{...props, match: {params}} } />;
        }

        const CreateRoomWrapper = (props) => {
            const history = useNavigate();
            return <CreateRoomPage {...{...props, history }} />;
        }

        const RoomJoinWrapper = (props) => {
            const history = useNavigate();
            return <RoomJoinPage {...{...props, history }} />;
        }

        return (
            <Router>
                <Routes>
                    <Route exact path="/" element={<div>This is the Home Page</div>} />
                    <Route path="/join" element={<RoomJoinWrapper />} />
                    <Route path="/create-room" element={<CreateRoomWrapper />} />
                    <Route path="/room/:roomCode" element={<RoomWrapper />} />
                </Routes>
            </Router>
        );
    }
}