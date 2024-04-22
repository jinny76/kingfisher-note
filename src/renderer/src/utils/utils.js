import PinyinMatch from 'pinyin-match'
const pinyinMatch = function (content, search) {
  let match = PinyinMatch.match(content ? content.toLowerCase() : "", search ? search.toLowerCase() : "");
  return !search || (match != null && match.length > 0)
}

const runUntil = function(condition, callback, timeout = 30 * 1000) {
  let existTime = new Date().getTime() + timeout;
  let timer = window.setInterval(() => {
    if (condition()) {
      clearInterval(timer);
      callback();
    } else if (new Date().getTime() > existTime) {
      clearInterval(timer);
    }
  }, 50);
}
export default {
  pinyinMatch, runUntil
}
