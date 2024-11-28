import * as sass from "sass";
import fs from "fs";
import path from "path";

if(process.env.status == "dev"){
    global.app.use((req, res, next) => {
        if(!req.url.endsWith(".css")) return next();
        const srcPath = path.join("front", "scss", req.path.replace(".css", ".scss"));
        const distPath = path.join("front", req.path);
        
        if(!fs.existsSync(srcPath)) return next();
        
        try{
            const result = sass.compile(srcPath, { style: "compressed" });
            fs.mkdirSync(path.dirname(distPath), { recursive: true });
            fs.writeFileSync(distPath, result.css);
        }catch(e){
            console.log(e);
        }

        next();
    });
}

fs.readdirSync("front/scss", { recursive: true }).filter(file => file.endsWith(".scss")).forEach(srcPath => {
    const distPath = path.join("front", srcPath.replace(".scss", ".css"));
    try{
        const result = sass.compile(path.join("front", "scss", srcPath), { style: "compressed" });
        fs.mkdirSync(path.dirname(distPath), { recursive: true });
        fs.writeFileSync(distPath, result.css);
    }catch(e){
        console.log(e);
    }
})