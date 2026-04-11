
const audio = new Audio();
let currentSong = null;

async function getSongs() {
    let a = await fetch("/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            const songName = decodeURIComponent(new URL(element.href).pathname.split("/songs/")[1]);
            songs.push(songName);
        }
    }
    return songs;
}

const playButton = document.querySelector(".songbuttons img:nth-child(2)");
const songInfo = document.querySelector(".songinfo");

const updatePlayButton = () => {
    if (!playButton) return;
    playButton.src = audio.paused ? "play.svg" : "pause.svg";
};

const setSongInfo = (track) => {
    if (!songInfo) return;
    const displayName = track.replace(/\.mp3$/, "").replace(/\(.*?\)/g, "").trim();
    songInfo.textContent = displayName;
};

const loadTrack = (track) => {
    const urlTrack = encodeURI(track);
    audio.src = `/songs/${urlTrack}`;
    audio.load();
    setSongInfo(track);
    currentSong = track;
};

const playMusic = (track) => {
    if (track && currentSong !== track) {
        loadTrack(track);
        audio.play();
        return;
    }

    if (audio.paused) {
        if (!audio.src && track) {
            loadTrack(track);
        }
        audio.play();
    } else {
        audio.pause();
    }
};

if (playButton) {
    playButton.addEventListener("click", () => {
        if (!currentSong) return;
        playMusic(currentSong);
    });
}

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("ended", updatePlayButton);

audio.addEventListener("error", (event) => {
    console.error("Audio playback error", event);
    updatePlayButton();
});

async function main() {
    let songs = await getSongs();
    console.log(songs);

    let songUL = document.querySelector(".playList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        const displayName = song.replace(/\.mp3$/, "").replace(/\(.*?\)/g, "").trim();
        songUL.innerHTML += `<li data-track="${song}">
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${displayName}</div>
                                <div>Daksh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="playnow.svg" alt="">
                            </div>
                         </li>`;
    }

    songUL.addEventListener("click", (event) => {
        const li = event.target.closest("li[data-track]");
        if (!li) return;
        const track = li.dataset.track;
        if (track) {
            playMusic(track);
        }
    });
}

main();