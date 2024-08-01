const format = {
    formatMess(mess, div){
        mess = format.changeText(mess);
        
        div.innerHTML = mess;
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
    }
}