const websites = {
  'www.bilibili.com': {
    debug: false, replace: 'www.b.com',
    loadScript: `
    window.KFEventHandler = {
      captureSubtitle: function(){
        let button = document.querySelector(".bpx-player-ctrl-subtitle");
        if (button) {
          button.childNodes[1].childNodes[0].click();
        }
      }
    };

    window.KfXHR = (function(){

      // save the native XHR method to xhrConstructor;
      var xhrType = XMLHttpRequest ? "XMLHttpRequest" : "ActiveXObject";
      var xhrConstructor = window[xhrType];

      // now override the native method
      window[xhrType] = function(){

        // A new XMLHttpRequest instance,
        // the class wraps this instance
        this._xhr = new (Function.prototype.bind.apply(xhrConstructor, arguments));

        // Mock properties of XHR
        this.response = "";
        this.readyState = 0;
        this.responseText = "";
        this.responseType = 'text';
        this.responseURL = "";
        this.responseXML = null;
        this.status = 0;
        this.statusText = "";
        this.timeout = 0;
        this.withCredentials = false;

        var _this = this;

        // Mock Events of XHR
        this.onreadystatechange = function(){};
        this.onabort = function(){};
        this.onerror = function(){};
        this.onload = function(){};
        this.onloadstart = function(){};
        this.ontimeout = function(){};
        this.onloadend = function(){};

        this._xhr.onreadystatechange = function () {
          _this.getMockProperties();
          if(KfXHR.events.onreadystatechange.apply(_this._xhr, arguments))
            _this.onreadystatechange.apply(_this._xhr, arguments);
        };

        this._xhr.onabort = function () {
          _this.getMockProperties();
          if(KfXHR.events.onabort.apply(_this._xhr, arguments))
            _this.onabort.apply(_this._xhr, arguments);
        };

        this._xhr.onerror = function () {
          _this.getMockProperties();
          if(KfXHR.events.onerror.apply(_this._xhr, arguments))
            _this.onerror.apply(_this._xhr, arguments);
        };

        this._xhr.onload = function () {
          _this.getMockProperties();
          if(KfXHR.events.onload.apply(_this._xhr, arguments))
            _this.onload.apply(_this._xhr, arguments);
        };

        this._xhr.onloadstart = function () {
          _this.getMockProperties();
          if(KfXHR.events.onloadstart.apply(_this._xhr, arguments))
            _this.onloadstart.apply(_this._xhr, arguments);
        };

        this._xhr.ontimeout = function () {
          _this.getMockProperties();
          if(KfXHR.events.ontimeout.apply(_this._xhr, arguments))
            _this.ontimeout.apply(_this._xhr, arguments);
        };

        this._xhr.onloadend = function () {
          _this.getMockProperties();
          if(KfXHR.events.onloadend.apply(_this._xhr, arguments))
            _this.onloadend.apply(_this._xhr, arguments);
        };
      };

      window[xhrType].prototype.UNSENT = 0;
      window[xhrType].prototype.OPENED = 1;
      window[xhrType].prototype.HEADERS_RECEIVED = 2;
      window[xhrType].prototype.LOADING = 3;
      window[xhrType].prototype.DONE = 4;
      window[xhrType].prototype.KfXHRVersion = 0.3;

      window[xhrType].prototype.getMockProperties = function(){
        try{ this.response = this._xhr.response; }catch(e){}
        try{ this.readyState = this._xhr.readyState; }catch(e){}
        try{ this.responseText = this._xhr.responseText; }catch(e){}
        try{ this.responseURL = this._xhr.responseURL; }catch(e){}
        try{ this.responseXML = this._xhr.responseXML; }catch(e){}
        try{ this.status = this._xhr.status; }catch(e){}
        try{ this.statusText = this._xhr.statusText; }catch(e){}
      };

      window[xhrType].prototype.setMockProperties = function(){
        this._xhr.responseType = this.responseType;
        this._xhr.timeout = this.timeout;
        this._xhr.withCredentials = this.withCredentials;
      };

      window[xhrType].prototype.abort = function(){
        KfXHR.methods.notify.abort.apply(this, arguments);
        this.setMockProperties();
        var r = typeof KfXHR.methods.override.abort==="function" ?
          KfXHR.methods.override.abort.apply(this, arguments) :
          this._xhr.abort.apply(this._xhr, arguments) ;
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.getAllResponseHeaders = function(){
        KfXHR.methods.notify.getAllResponseHeaders.apply(this, arguments);
        var r = typeof KfXHR.methods.override.getAllResponseHeaders==="function" ?
          KfXHR.methods.override.getAllResponseHeaders.apply(this, arguments) :
          this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.getResponseHeader = function(){
        KfXHR.methods.notify.getResponseHeader.apply(this, arguments);
        var r = typeof KfXHR.methods.override.getResponseHeader==="function" ?
          KfXHR.methods.override.getResponseHeader.apply(this, arguments) :
          this._xhr.getResponseHeader.apply(this._xhr, arguments);
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.overrideMimeType = function(){
        KfXHR.methods.notify.overrideMimeType.apply(this, arguments);
        this.setMockProperties();
        var r = typeof KfXHR.methods.override.overrideMimeType==="function" ?
          KfXHR.methods.override.overrideMimeType.apply(this, arguments) :
          this._xhr.overrideMimeType.apply(this._xhr, arguments) ;
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.setRequestHeader = function(){
        KfXHR.methods.notify.setRequestHeader.apply(this, arguments);
        this.setMockProperties();
        var r = typeof KfXHR.methods.override.setRequestHeader==="function" ?
          KfXHR.methods.override.setRequestHeader.apply(this, arguments) :
          this._xhr.setRequestHeader.apply(this._xhr, arguments);
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.send = function(){
        KfXHR.methods.notify.send.apply(this, arguments);
        this.setMockProperties();
        var r = typeof KfXHR.methods.override.send==="function" ?
          KfXHR.methods.override.send.apply(this, arguments) :
          this._xhr.send.apply(this._xhr, arguments) ;
        this.getMockProperties();
        return r;
      };

      window[xhrType].prototype.open = function(){
        KfXHR.methods.notify.open.apply(this, arguments);
        this.setMockProperties();
        var r = typeof KfXHR.methods.override.open==="function" ?
          KfXHR.methods.override.open.apply(this, arguments) :
          this._xhr.open.apply(this._xhr, arguments) ;
        this.getMockProperties();
        return r;
      };

      return {
        methods:{
          notify: {
            open: function(){},
            send: function(){},
            setRequestHeader: function(){},
            overrideMimeType: function(){},
            getResponseHeader: function(){},
            getAllResponseHeaders: function(){},
            abort: function(){}
          },
          override: {
            open: false,
            send: false,
            setRequestHeader: false,
            overrideMimeType: false,
            getResponseHeader: false,
            getAllResponseHeaders: false,
            abort: false
          }
        },
        events:{
          onreadystatechange: function(){ return true; },
          onabort: function(){ return true; },
          onerror: function(){ return true; },
          onload: function(){ return true; },
          onloadstart: function(){ return true; },
          ontimeout: function(){ return true; },
          onloadend: function(){ return true; }
        }
      };
    })();

    KfXHR.events.onreadystatechange = function(event){
      if (event.srcElement.responseURL.indexOf("https://aisubtitle") !== -1) {
        if (event.srcElement.readyState === 4 && event.srcElement.status === 200) {
          let response = JSON.parse(event.srcElement.responseText);
          window.kfsocket.send(JSON.stringify({
            action: 'captureSubtitle',
            args: {
              type: 'bilibili',
              subtitle: response,
              url: window.location.href,
            },
          }));
        }
      }
    }

    let timer = setInterval(() => {
      let button = document.querySelector(".bpx-player-ctrl-web");
      if (button) {
        clearInterval(timer);
        button.click();
      }
    }, 1000);
    `,
    captureSubtitle: true,
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
  },
  'live.bilibili.com': {
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
  'www.icourse163.org': {
    debug: false,
    loadScript: `             
              let iframe = document.createElement('iframe');
          　　 document.body.appendChild(iframe);
          　　 window.console = iframe.contentWindow.console;
              console.log("初始化")
              let moved = false;
              let srcChanged = false;
              let timer = setInterval(() => {
                let div = document.querySelector(".ux-video-player");  
                let video = document.body.querySelector(".u-edu-h5player-mainvideo").childNodes[0];
                video.crossOrigin = "anonymous";             
                if (div) {
                  div.style.width = "100%";
                  div.style.height = "100vh";
                  document.body.style.minWidth = "0px";
                  if (!moved) {
                    document.body.insertBefore(div, document.body.children[0]);
                    moved = true
                  }                  
                  let src = video?.childNodes[0]?.src;
                  if (src !== '' && !srcChanged) {
                    srcChanged = true;
                    video.removeChild(video.childNodes[0]);
                    setTimeout(() => {
                      video.src = src;
                      video.play();
                    },200);
                  }                                
              }
            }, 1000);`,
  },
  "www.imooc.com": {
    debug: false,
    loadScript: `             
              let iframe = document.createElement('iframe');
          　　 document.body.appendChild(iframe);
          　　 window.console = iframe.contentWindow.console;
              console.log("初始化");
              let kfTimer = setInterval(() => {
                clearInterval(kfTimer);
                let div = document.querySelector(".course-video-wrap");           
                if (div) {
                  div.style.width = "100%";
                  div.style.height = "100vh";
                  document.body.style.minWidth = "0px";                  
                  document.body.insertBefore(div, document.body.children[0]);                                                                             
              }
            }, 1000);`,
  }
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
