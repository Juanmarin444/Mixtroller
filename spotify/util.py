from email import header
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get
import base64

import environ

env = environ.Env()

BASE_URL = "https://api.spotify.com/v1/me/"
PLAYLISTS_URL = "https://api.spotify.com/v1/playlists/"
ALBUMS_URL = "https://api.spotify.com/v1/albums/"

def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)

    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)

        return True
        
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    authorization = env('CLIENT_ID') + ':' + env('CLIENT_SECRET')
    string_bytes = authorization.encode("ascii")
    base64_bytes = base64.b64encode(string_bytes)
    base64_string = base64_bytes.decode("ascii")

    headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + base64_string }

    response = post('https://accounts.spotify.com/api/token', headers=headers, data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': env('CLIENT_ID')
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    headers = { "Content-Type": "applications/json", "Authorization": "Bearer " + tokens.access_token }

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        return { "Error": "Issue with request" }


def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)
    

def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)

def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)


def get_playlist(session_id, playlist_id):
    tokens = get_user_tokens(session_id)
    headers = { "Content-Type": "applications/json", "Authorization": "Bearer " + tokens.access_token }

    response = get(PLAYLISTS_URL + playlist_id, {}, headers=headers)
    try:
        return response.json()
    except:
        return { "Error": "Issue with request" }


def get_album(session_id, album_id):
    tokens = get_user_tokens(session_id)
    headers = { "Content-Type": "applications/json", "Authorization": "Bearer " + tokens.access_token }

    response = get(ALBUMS_URL + album_id, {}, headers=headers)
    try:
        return response.json()
    except:
        return { "Error": "Issue with request" }


def get_playlist_tracks(session_id, playlist_id, limit, offset):
    tokens = get_user_tokens(session_id)
    headers = { "Content-Type": "applications/json", "Authorization": "Bearer " + tokens.access_token }

    response = get(PLAYLISTS_URL + playlist_id + '/tracks', {"limit": limit, "offset": offset}, headers=headers )

    try:
        return response.json()
    except:
        return { "Error": "Issue with request" }

def get_album_tracks(session_id, album_id, limit, offset):
    tokens = get_user_tokens(session_id)
    headers = { "Content-Type": "applications/json", "Authorization": "Bearer " + tokens.access_token }

    response = get(ALBUMS_URL + album_id + '/tracks', {"limit": limit, "offset": offset}, headers=headers )

    try:
        return response.json()
    except:
        return { "Error": "Issue with request" }