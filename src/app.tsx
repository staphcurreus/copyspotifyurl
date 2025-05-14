async function main() {
  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification || !Spicetify?.ContextMenu) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const locale = {
    copied: "Copied",
    error: "Error",
    copyUrl: "Copy Spotify URL"
  };

  function getSpotifyUrl(uriObj: any): string | null {
    const type = uriObj.type;
    const id = uriObj._base62Id || uriObj.id;
    switch (type) {
      case Spicetify.URI.Type.TRACK:
        return `https://open.spotify.com/track/${id}`;
      case Spicetify.URI.Type.ALBUM:
        return `https://open.spotify.com/album/${id}`;
      case Spicetify.URI.Type.ARTIST:
        return `https://open.spotify.com/artist/${id}`;
      case Spicetify.URI.Type.PLAYLIST:
      case Spicetify.URI.Type.PLAYLIST_V2:
        return `https://open.spotify.com/playlist/${id}`;
      case Spicetify.URI.Type.SHOW:
        return `https://open.spotify.com/show/${id}`;
      case Spicetify.URI.Type.EPISODE:
        return `https://open.spotify.com/episode/${id}`;
      case Spicetify.URI.Type.PROFILE:
        return `https://open.spotify.com/user/${uriObj.username}`;
      default:
        return null;
    }
  }

  function copyAndNotify(text: string | null) {
    if (text) {
      Spicetify.Platform.ClipboardAPI.copy(text);
      Spicetify.showNotification(`${locale.copied}: ${text}`);
    } else {
      Spicetify.showNotification(`${locale.error}: Invalid URI`);
    }
  }

  const shouldAddContextMenu: Spicetify.ContextMenu.ShouldAddCallback = (uris: string[]) => {
    if (uris.length !== 1) return false;
    const uriObj = Spicetify.URI.fromString(uris[0]);
    const supportedTypes = [
      Spicetify.URI.Type.TRACK,
      Spicetify.URI.Type.ALBUM,
      Spicetify.URI.Type.ARTIST,
      Spicetify.URI.Type.PLAYLIST,
      Spicetify.URI.Type.PLAYLIST_V2,
      Spicetify.URI.Type.SHOW,
      Spicetify.URI.Type.EPISODE,
      Spicetify.URI.Type.PROFILE
    ];
    return supportedTypes.includes(uriObj.type);
  };

  new Spicetify.ContextMenu.Item(
    locale.copyUrl,
    async (uris: string[]) => {
      try {
        const uriObj = Spicetify.URI.fromString(uris[0]);
        const url = getSpotifyUrl(uriObj);
        copyAndNotify(url);
      } catch (e: any) {
        Spicetify.showNotification(`${locale.error}: ${e.message}`);
      }
    },
    shouldAddContextMenu,
    "copy"
  ).register();
}

export default main;
