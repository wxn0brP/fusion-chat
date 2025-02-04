import ogs from "open-graph-scraper";
function processOgsToEmbed(data, link) {
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
            "Type": data.ogType || "Unknown",
            "Source": link,
            "Image Available": image ? "Yes" : "No",
            "Domain": new URL(link).hostname,
        }
    };
    if (data.ogSiteName) {
        embed.customFields["Page"] = data.ogSiteName;
    }
    if (data.article && data.article.published_time) {
        embed.customFields["Release Date"] = new Date(data.article.published_time).toLocaleDateString();
    }
    return embed;
}
async function ogsToEmbed(link) {
    const data = await ogs({ url: link });
    if (data.error)
        return null;
    return processOgsToEmbed(data.result, link);
}
export default ogsToEmbed;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2dUb0VtYmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmFjay9sb2dpYy9vZ1RvRW1iZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sb0JBQW9CLENBQUM7QUFFckMsU0FBUyxpQkFBaUIsQ0FBQyxJQUFTLEVBQUUsSUFBWTtJQUM5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUM7SUFDNUUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQztJQUMxRyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7SUFDcEgsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztJQUVsRCxNQUFNLEtBQUssR0FBRztRQUNWLEtBQUs7UUFDTCxXQUFXO1FBQ1gsS0FBSztRQUNMLEdBQUc7UUFDSCxZQUFZLEVBQUU7WUFDVixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTO1lBQ2hDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDdkMsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVE7U0FDbkM7S0FDSixDQUFDO0lBRUYsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDLENBQUM7UUFDaEIsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ2pELENBQUM7SUFDRCxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNwRyxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVELEtBQUssVUFBVSxVQUFVLENBQUMsSUFBWTtJQUNsQyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLElBQUcsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLElBQUksQ0FBQztJQUMzQixPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVELGVBQWUsVUFBVSxDQUFDIn0=