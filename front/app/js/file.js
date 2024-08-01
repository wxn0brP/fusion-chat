const fileFunc = {
    read(options) {
        const { file, callback, maxSize, maxName, endpoint } = options;
        if(!file || !callback || !maxSize || !maxName || !endpoint){
            return;
        }

        if(file.size > maxSize){
            uiFunc.uiMsg(translateFunc.get("File size exceeds $ limit", (maxSize / 1024 / 1024) + "MB") + ".");
            return;
        }
        if(file.name.length > maxName){
            uiFunc.uiMsg(translateFunc.get("File name exceeds $ char limit", maxName) + ".");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint);

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);
                debugFunc.msg(response);
                if(xhr.status === 200){
                    uiFunc.uiMsg(translateFunc.get("File uploaded successfully") + ".");
                    callback(xhr);
                }else{
                    uiFunc.uiMsg(translateFunc.get("Failed to upload file") + ": " + xhr.statusText);
                }
            };

            xhr.onerror = () => {
                uiFunc.uiMsg(translateFunc.get("An error occurred during the file upload") + ".");
            };

            const token = localStorage.getItem("token");
            if(!token){
                uiFunc.uiMsg(translateFunc.get("No authentication data found") + ".");
                return;
            }

            xhr.setRequestHeader("Authorization", token);
            const formData = new FormData();
            formData.append("file", file);
            xhr.send(formData);
        };

        reader.readAsArrayBuffer(file);
    },

    profile(){
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ['image/png', 'image/jpeg', "image/jpg", 'image/gif', 'image/webp'].join(', ');
        input.click();
        input.addEventListener("change", e => {
            const opt = {
                file: e.target.files[0],
                callback: () => {
                    lo("File uploaded successfully");
                },
                maxSize: 1024*1024,
                maxName: 60,
                endpoint: "/profileUpload"
            }
    
            fileFunc.read(opt);
        });
    }
};