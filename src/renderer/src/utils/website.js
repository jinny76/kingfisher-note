const websites = {
  'www.bilibili.com': {
    replace: 'www.b.com', loadScript: `let timer = setInterval(() => {
              let button = document.querySelector(".bpx-player-ctrl-web");
              if (button) {
                clearInterval(timer);
                button.click();
              }
            }, 1000);`,
  }, 'www.youtube.com': {
    replace: 'www.y.com',
  }, 'open.163.com': {
    videoId: '#open-video_html5_api', loadScript: `let timer = setInterval(() => {
              let button = document.querySelector(".vjs-grow-button");
              if (button) {
                clearInterval(timer);
                button.click();
                let videoMainBox = document.querySelector(".video-main-box");
                if (videoMainBox) {
                  document.body.appendChild(videoMainBox);
                  document.body.removeChild(document.body.children[0]);
                  document.body.removeChild(document.body.children[0]);
                }
              }
            }, 1000);`,
  }, 'live.bilibili.com': {
    loadScript: `let timer = setInterval(() => {
              let div = document.querySelector(".player-section");
              if (div) {
                clearInterval(timer);
                div.style.width = "100%";
                div.style.height = "100vh";
                document.body.style.minWidth = "0px";
                document.body.appendChild(div);
                document.body.removeChild(document.querySelector(".live-room-app"));
              }
            }, 1000);`,
  },
};

const findWebsite = url => {
  let webKey = Object.keys(websites).find(website => url.includes(website));
  if (webKey) {
    return websites[webKey];
  } else {
    return null;
  }
};

const replaceWebsite = url => {
  let result = Object.keys(websites).find(website => url.includes(website));

  if (result && websites[result].replace) {
    return url.replaceAll(result, websites[result].replace);
  }
  return url;
};

const handleReplacedWebsite = url => {
  let website = Object.values(websites).
    find(website => url.includes(website.replace));

  if (website) {
    url = url.replace(website.replace,
      Object.keys(websites).find(key => websites[key] === website));
  }
  return url;
};

export default {
  handleReplacedWebsite, replaceWebsite, findWebsite, websites,
};
