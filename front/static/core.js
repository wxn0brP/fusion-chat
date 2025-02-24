var lo = console.log;
const delay = ms => new Promise(res => setTimeout(res, ms));

const cw = {};

cw.proto = {
    html(v){
        if(this.innerHTML != undefined){
            this.innerHTML = v;
            return this;
        }else{
            return this.innerHTML;
        }
    },

    v(v){
        if(this.value != undefined){
            this.value = v;
            return this;
        }else{
            return this.value;
        }
    },

    on(event, fn){
        this.addEventListener(event, fn);
    },

    css(style, val=null){
        const ele = this;
        if(typeof style == "string"){
            if(val != null){
                ele.style[style] = val;
            }else{
                ele.style = style;
            }
        }else if(typeof style == "object"){
            Object.assign(ele.style, style);
        }
    },

    attrib(att, arg=null){
        if(arg){
            this.setAttribute(att, arg);
        }else{
            return this.getAttribute(att);
        }
        return this;
    },
    
    clA(arg){
        this.classList.add(arg);
        return this;
    },
    
    clR(arg){
        this.classList.remove(arg);
        return this;
    },
    
    clT(className){
        this.classList.toggle(className);
        return this;
    },
    
    animateFade(from, { time=200, cb=null }){
        const style = this.style;
        const steps = 50;
        const timeToStep = time / steps;
        const d = (from == 0 ? 1 : -1)/steps;
        let index = 0;
        style.opacity = from;

        const interval = setInterval(() => {
            if(index >= steps){
                clearInterval(interval);
                if(cb && typeof cb == "function") cb();
                return;
            }
            style.opacity = parseFloat(style.opacity) + d;
            index++;
        }, timeToStep);
        return this;
    },

    fadeIn(display="block", cb=null){
        if(typeof display == "function"){
            cb = display;
            display = "block";
        }
        
        this.css("display", display);
        this.animateFade(0, { cb });
        this.fade = true;
        return this;
    },

    fadeOut(cb=null){
        this.animateFade(1, { time: 300, cb });
        setTimeout(() => this.css("display", "none"), 300);
        this.fade = false;
        return this;
    },

    fade: true,
    fadeToggle(){
        if(this.fade){
            this.fadeOut();
        }else{
            this.fadeIn();
        }
        return this;
    },

    add(child){
        this.appendChild(child);
        return this;
    },

    addUp(child){
        this.insertBefore(child, this.firstChild);
        return this;
    },
};

cw.init = function(){
    Object.assign(HTMLElement.prototype, this.proto);
}
cw.init();

cw.rand = function(min, max){
	return Math.round(Math.random() * (max-min) + min);
}

cw.round = function(a, b){
	const factor = Math.pow(10, b);
	return Math.round(a*factor)/factor;
}

cw.get = function(url){
    if(!url) return false;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    
    if(xhr.status == 200){
        return xhr.responseText;
    }else if(xhr.status == 404){
        return false;
    }else return null;
}