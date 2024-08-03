const format = {
    formatMess(mess_plain, div){
        let mess = format.changeText(mess_plain);
        div.innerHTML = mess;

        const elemensts = format.getElements(mess_plain);
        for(const element of elemensts){
            div.appendChild(document.createElement('br'));
            div.appendChild(element);
        }
    },

    changeText(text){
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');

        const excludePattern = /```(.*?)```/g;
        const excludeMatches = text.match(excludePattern);
        const exclusions = [];
        if(excludeMatches){
            for(const match of excludeMatches){
                const exclusion = match.slice(3, -3);
                exclusions.push(exclusion);
                const placeholder = `@EXCLUSION${exclusions.length}@`;
                text = text.replace(match, placeholder);
            }
        }

        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        text = text.replace(/\/\/\/(.*?)\/\/\//g, '<i>$1</i>');
        text = text.replace(/--(.*?)--/g, '<strike>$1</strike>');
        text = text.replace(/__(.*?)__/g, '<u>$1</u>');

        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" onclick="messFunc.linkClick(event)">$1</a>');
        text = text.replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g, '<a href="mailto:$1">$1</a>');

        text = text.replace(/##([0-9A-Fa-f]{3,6})\s(.*?)\s#c/g, '<span style="color:#$1">$2</span>');
        text = text.replace(/#(red|green|blue|yellow|orange|purple|pink|gold|grey)\s(.*?)\s#c/gi, '<span style="color:$1">$2</span>');
        text = text.replace(/#(fc)\s(.*?)\s#c/gi, '<span style="color:var(--accent)">$2</span>');
        
        text = text.replaceAll("\n", "<br />");

        for(let i=0; i<exclusions.length; i++){
            const exclusion = exclusions[i];
            const placeholder = `@EXCLUSION${i + 1}@`;
            text = text.replace(placeholder, exclusion);
        }

        return text;
    },

    responeMess(mess_id, div){
        const mess = document.querySelector(`#mess__${mess_id}`);
        if(!mess) return;

        const messContent = mess.querySelector(".mess_content").getAttribute("_plain");

        const resMsgDiv = document.createElement("div");
        resMsgDiv.innerHTML = messContent;
        resMsgDiv.classList.add("res_msg");
        resMsgDiv.addEventListener("click", () => {
            mess.classList.add("res_msg__animate");
            setTimeout(() => mess.classList.remove("res_msg__animate"), 3000); 
        });
        div.addUp(resMsgDiv);
    },

    getElements(text){
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(regex);
        if(!matches) return [];
        return matches.map(link => format.mediaPreview(link)).filter(ele => !!ele);
    },

    mediaPreview(link){
        if(!link) return;

        function chcek(link){
            const xhr = new XMLHttpRequest();
            xhr.open("HEAD", link, false);
            xhr.send();
            return xhr.status == 200;
        }

        if(/\.(mp3|wav|ogg|.m4a)$/i.test(link)){
            if(!chcek(link)) return;
            const ele = document.createElement('audio');
            ele.src = link;
            ele.controls = true;
            return ele;
        }

        if(/\.(mp4|mkv|webm|avi)$/i.test(link)){
            if(!chcek(link)) return;
            const ele = document.createElement('video');
            ele.src = link;
            ele.controls = true;
            ele.style.maxWidth = '65%';
            ele.style.height = 'auto'; 
            ele.style.borderRadius = '2rem';
            return ele;
        }

        if(/\.(png|jpg|gif|ico|jpeg|webp)$/i.test(link)){
            if(!chcek(link)) return;
            const ele = document.createElement('img');
            ele.src = link;
            ele.style.maxWidth = '100%';
            ele.style.height = 'auto';
            return ele;
        }

        if(link.includes("youtube.com") || link.includes("youtu.be")) {
            function extractYouTubeVideoId(link) {
                const match = link.match(/(?:\?v=|\/embed\/|\.be\/|\/v\/|\/\d{1,2}\/|\/e\/|watch\?v=|youtu\.be\/|youtube\.com\/(?:v|e|embed)\/|youtube\.com\/user\/[^#\/]+#p\/[^#\/]+\/)([^"&?\/ ]{11})/);
                return (match && match[1]) ? match[1] : null;
            }
            
            const videoId = extractYouTubeVideoId(link);
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            
            iframe.allowFullscreen = true;
            iframe.style.maxWidth = '100%';
            iframe.style.width = '500px';
            iframe.style.height = '300px';
            iframe.style.borderRadius = '2rem';
            return iframe;
        }
        
        if(link.includes("tiktok.com")){
            const iframe = document.createElement('iframe');
            function extractTikTokVideoId(link){
                const regex = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)([\w-]+)/;
                const match = link.match(regex);
                return match ? match[1] : null;
            }
            const videoId = extractTikTokVideoId(link);
            iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
            iframe.allowfullscreen = true;
            
            iframe.style.maxWidth = '100%';
            iframe.style.width = '400px';
            iframe.style.height = '700px';
            iframe.style.borderRadius = '2rem';
            return iframe;
        }

        if(link.includes("reddit.com")){
            const l = link.split("?") || [link];
            link = l[0];
            if(!link.endsWith("/")) link += "/";
            
            const api = JSON.parse(cw.get(`${link}.json?limit=2`));
            const post = api[0]?.data.children[0]?.data;
            const ele = document.createElement("div");
    
            const title = post.title;
            const author = post.author;
            ele.innerHTML = `autor: ${author}<br />tytuł: ${title}`
            return ele;
        }

        if(link.includes("spotify.com")){
            const iframe = document.createElement('iframe');
            function extractSpotifyId(link){
                const trackMatch = link.match(/track\/([a-zA-Z0-9]+)/);
                if(trackMatch && trackMatch[1]){
                    return "track/"+trackMatch[1];
                }
                const playlistMatch = link.match(/playlist\/([a-zA-Z0-9]+)/);
                if(playlistMatch && playlistMatch[1]){
                    return "playlist/"+playlistMatch[1];
                }
                return null;
            }
            const videoId = extractSpotifyId(link);
            if(!videoId) return null;
            iframe.src = `https://open.spotify.com/embed/${videoId}`;
            iframe.allowfullscreen = true;
            
            iframe.style.maxWidth = '100%';
            iframe.style.width = '400px';
            iframe.style.height = '84px';
            iframe.style.borderRadius = '1rem';
            return iframe;
        }

        const extRegex = /\.(js|html|css|py|c|cpp|java|cs|php|rb|swift|kt|ts|go|rs|pl|sh|sql|r|m|txt)$/i
        if(extRegex.test(link)){
            const language = link.match(extRegex)[0].replace(".","");
    
            const pre = document.createElement("pre");
            pre.classList.add("preCode");
            pre.innerHTML = `<span style="color: green;">${language}</span>:<br /><br />`;
            pre.style.overflow = "auto";
            
            const code = document.createElement("code");
            const file = cw.get(link);
            code.innerHTML = hljs.highlight(file, {language}).value;
            if(file.length>500 || file.split("\n").length > 10){
                pre.style.maxHeight = "17rem";
            }
    
            pre.appendChild(code);
            return pre;
        }
    }
}