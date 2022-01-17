/**
 * （部分）国际域名后缀
 *
 */
export const isExistDomain = name => {
  // eslint-disable-next-line
  // let existDomain = ["com", "org", "net", "int", "edu", "gov", "mil", "arpa", "top", "ltd", "tech", "shop", "vip", "xyz", "wang", "cloud", "online", "site", "love", "art", "xin", "store", "fun", "website", "press", "space", "beer", "luxe", "video", "group", "fit", "yoga", "pro", "ink", "biz", "info", "design", "link", "work", "mobi", "kim", "pub", "name", "asia", "red", "live", "wiki", "life", "world", "run", "show", "city", "gold", "today", "plus", "cool", "company", "chat", "zone", "fans", "law", "host", "center", "club", "email", "fund", "social", "team", "aero", "arpa", "asia", "biz", "cat", "coop", "int", "jobs", "museum", "onion", "pub", "mobi", "tel", "coffee", "college", "computer", "cool", "credit", "one", "win", "app", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", 'at', "au", "aw", "ax", "az", "ba", "bb", 'bd', "be", "bf", "bg", "bh", "bi", 'bj', "bl", "bm", "bn", 'bo', "bq", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", 'mc', "md", "me", "mf", 'mg', "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", 'nc', "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "za", "zm", "zw"];

  // eslint-disable-next-line
 let existDomain = ["com", "org", "net", "edu", "gov", "mil", "top", "biz", "info", "mobi", "name", "asia", "aero", "asia", "biz", "cat", "coop", "jobs", "email", "mil", "mobi", "tel", "cc", "cn", "dk", "jp", "vip", "club", "tech", "pro", "me", "us", "zone", "space","im","io"];

  return existDomain.indexOf(name);
};

/* 标签转义 */
export function html2Escape(html, flag) {
  if (flag) {
    return html;
  } else {
    const str = html + '';
    return str.replace(/[<>&"]/g, function (c) {
      return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
    });
  }
}
