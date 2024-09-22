import ogs from "open-graph-scraper";

function processOgsToEmbed(data, link){
    const title = data.ogTitle || data.twitterTitle || data.title || "No title";
    const description = data.ogDescription || data.twitterDescription || data.description || "No description";
    const image = (data.ogImage && data.ogImage[0] && data.ogImage[0].url) || data.twitterImage || data.favicon || null;
    const url = data.ogUrl || data.requestUrl || link;

    const embed = {
        title,
        description,
        image,
        url,
        customFields: {
            "Type": data.ogType || "Unknow",
            "Source": link,
            "Image Available": image ? "Yes" : "No",
            "Domain": new URL(link).hostname,
        }
    };

    if(data.ogSiteName){
        embed.customFields["Page"] = data.ogSiteName;
    }
    if(data.article && data.article.published_time){
        embed.customFields["Release Date"] = new Date(data.article.published_time).toLocaleDateString();
    }

    return embed;
}

async function ogsToEmbed(link){
    const data = await ogs({ url: link });
    if(data.error) return null;
    return processOgsToEmbed(data.result, link);
}

export default ogsToEmbed;