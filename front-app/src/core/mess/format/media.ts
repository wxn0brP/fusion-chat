import cw from "../../../core";
import hub from "../../../hub";
import createMediaPopup from "../../../ui/components/media";
hub("mess/format/media");

export default function format_media(link: string) {
    if (!link) return;

    function check(link) {
        const xhr = new XMLHttpRequest();
        xhr.open("HEAD", link, false);
        xhr.send();
        return xhr.status == 200;
    }

    if (/\.(mp3|wav|ogg|.m4a)$/i.test(link)) {
        if (!check(link)) return;
        const ele = document.createElement("audio");
        ele.src = link;
        ele.controls = true;
        return ele;
    }

    if (/\.(mp4|mkv|webm|avi)$/i.test(link)) {
        if (!check(link)) return;
        const ele = document.createElement("video");
        ele.src = link;
        ele.controls = true;
        ele.style.maxWidth = "65%";
        ele.style.height = "auto";
        ele.style.borderRadius = "2rem";
        ele.style.cursor = "zoom-in";
        ele.onclick = () => createMediaPopup(link, { isVideo: true });
        return ele;
    }

    if (/\.(png|jpg|gif|ico|jpeg|webp|svg)$/i.test(link)) {
        if (!check(link)) return;
        const ele = document.createElement("img");
        ele.src = link;
        ele.style.maxWidth = "100%";
        ele.style.height = "auto";
        ele.style.cursor = "zoom-in";
        ele.onclick = () => createMediaPopup(link, { isVideo: false });
        return ele;
    }

    if (link.includes("youtube.com") || link.includes("youtu.be")) {
        function extractYouTubeVideoId(link) {
            const match = link.match(/(?:\?v=|\/embed\/|\.be\/|\/v\/|\/\d{1,2}\/|\/e\/|watch\?v=|youtu\.be\/|youtube\.com\/(?:v|e|embed)\/|youtube\.com\/user\/[^#\/]+#p\/[^#\/]+\/)([^"&?\/ ]{11})/);
            return (match && match[1]) ? match[1] : null;
        }

        const videoId = extractYouTubeVideoId(link);
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;

        iframe.allowFullscreen = true;
        iframe.style.maxWidth = "100%";
        iframe.style.width = "500px";
        iframe.style.height = "300px";
        iframe.style.borderRadius = "2rem";
        return iframe;
    }

    if (link.includes("tiktok.com")) {
        const iframe = document.createElement("iframe");
        function extractTikTokVideoId(link) {
            const regex = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)([\w-]+)/;
            const match = link.match(regex);
            return match ? match[1] : null;
        }
        const videoId = extractTikTokVideoId(link);
        iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
        iframe.allowFullscreen = true;

        iframe.style.maxWidth = "100%";
        iframe.style.width = "400px";
        iframe.style.height = "700px";
        iframe.style.borderRadius = "2rem";
        return iframe;
    }

    if (link.includes("reddit.com")) {
        const l = link.split("?") || [link];
        link = l[0];
        if (!link.endsWith("/")) link += "/";

        const api = JSON.parse(cw.get(`${link}.json?limit=2`));
        const post = api[0]?.data.children[0]?.data;
        const ele = document.createElement("div");

        const title = post.title;
        const author = post.author;
        ele.innerHTML = `autor: ${author}<br />tytuł: ${title}`
        return ele;
    }

    if (link.includes("spotify.com")) {
        const iframe = document.createElement("iframe");
        function extractSpotifyId(link) {
            const trackMatch = link.match(/track\/([a-zA-Z0-9]+)/);
            if (trackMatch && trackMatch[1]) {
                return "track/" + trackMatch[1];
            }
            const playlistMatch = link.match(/playlist\/([a-zA-Z0-9]+)/);
            if (playlistMatch && playlistMatch[1]) {
                return "playlist/" + playlistMatch[1];
            }
            return null;
        }
        const videoId = extractSpotifyId(link);
        if (!videoId) return null;
        iframe.src = `https://open.spotify.com/embed/${videoId}`;
        iframe.allowFullscreen = true;

        iframe.style.maxWidth = "100%";
        iframe.style.width = "400px";
        iframe.style.height = "84px";
        iframe.style.borderRadius = "1rem";
        return iframe;
    }
}