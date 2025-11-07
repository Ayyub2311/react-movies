export const getProxiedPosterUrl = (url) => {
    if (!url) return "/no-movie.png";

    try{
        const imageHost = "image.tmdb.org";
        if (url.includes(imageHost)) {
            const withoutProtocol = url.replace(/^https?:\/\//,"");
            return `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}`;   
        }
        return url
    } catch {
        return "/no-movie.png";
    }
}