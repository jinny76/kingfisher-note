import PinyinMatch from 'pinyin-match'
const pinyinMatch = function (content, search) {
  let match = PinyinMatch.match(content ? content.toLowerCase() : "", search ? search.toLowerCase() : "");
  return !search || (match != null && match.length > 0)
}


export default {
  pinyinMatch
}
