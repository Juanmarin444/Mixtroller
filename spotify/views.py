from django.shortcuts import render, redirect
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote
import environ

env = environ.Env()

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': env('REDIRECT_URI'),
            'client_id': env('CLIENT_ID')
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': env('REDIRECT_URI'),
        'client_id': env('CLIENT_ID'),
        'client_secret': env('CLIENT_SECRET')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "item" not in response:
            no_song = {
                'title': 'Where song?',
                'artist': 'By: Nobody',
                'duration': '0',
                'time': '0',
                'image_url': 'https://seranking.com/blog/wp-content/uploads/2021/01/404_01-min.jpg',
                'is_playing': 'false',
                'votes': '0',
                'votes_required': room.votes_to_skip,
                'id': 'None'
            }

            return Response(no_song, status=status.HTTP_200_OK)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artrist_string += ", "
            name = artist.get("name")
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)


    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()

class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
        
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
        
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()

        
        return Response({}, status=status.HTTP_204_NO_CONTENT)

class GetPlayer(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player"
        response = execute_spotify_api_request(host, endpoint)
        context = response.get('context')
        
        if context == None:
            
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        player_type = context.get("type")
        uri =  context.get("uri")

        if player_type == "playlist":
            playlist_id = uri.replace('spotify:playlist:', '')

            playlist_data = get_playlist(host, playlist_id)



            playlist = {
                # GRAB THE DATA WRITTEN ON THE NOTECARD - DON'T FORGETTY
            }

            return Response(playlist_data, status=status.HTTP_200_OK)

        elif player_type == "album":
            album_id = uri.replace('spotify:album:', '')

            album_data = get_album(host, album_id)

            artist_string = ""

            for i, artist in enumerate(album_data.get('artists')):
                if i > 0:
                    artrist_string += ", "
                name = artist.get("name")
                artist_string += name

            tracks = album_data.get('tracks').get('items')
            tracks_list = []

            for i, track in enumerate(tracks):
                current_track = {}
                current_track['name'] = track.get('name')
                current_track['id'] = track.get('id')
                current_track['track_number'] = track.get('track_number')
                current_track['explicit'] = track.get("explicit")
                tracks_list.append(current_track)

            album = {
                'album_cover': album_data.get('images')[0].get('url'),
                'artist':  artist_string,
                'album_name': album_data.get('name'),
                'total_tracks': album_data.get('total_tracks'),
                'tracks': tracks_list
            }

            return Response(album, status=status.HTTP_200_OK)
