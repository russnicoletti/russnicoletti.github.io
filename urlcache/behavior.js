document.getElementById('populate-urls').onchange=urlPopulateChangeHandler;
document.getElementById('url-input').onkeydown=keyPressHandler;

function UrlCache() {
    this.NUM_VALID_CHARS = 64;
    this.urlsSet = [];
    this.urlsArray = [];
    this.dirty = [];
    this.searchString = new String();
    this.gettingFromCache = true;
    this.unique = 0;
    this.zeroValue = '0'.charCodeAt(0);
    this.aValue = 'a'.charCodeAt(0);
    this.AValue = 'A'.charCodeAt(0);
    this.NUM_NUMBERS = 10;
    this.NUM_LETTERS = 26;

    for (let i = 0; i < this.NUM_VALID_CHARS; ++i) {
        this.urlsSet[i] = new Set();
        this.urlsArray[i] = [];
        this.dirty[i] = true;
    }
}

UrlCache.prototype = {
    constructor: UrlCache,
    addToCache: function(url) {
        this.storeUrl(url);
    },

    initGetFromCache: function() {
        this.reset();
    },

    getFromCache: function(c) {
        this.searchString = this.searchString.concat(c);

        if (this.gettingFromCache) {
            let result = this.getUrlMatch(this.searchString);
            if (result.found) {
                return result.urlMatch;
            } else {
                this.gettingFromCache = false;
                return this.searchString;
            }
        } else {
            return this.searchString;
        }
    },

    getUniqueUrls: function() {},
    reset: function() {
        this.gettingFromCache = true;
        this.searchString = new String();
    },

    storeUrl: function(urlToCache) {
        if (urlToCache.length == 0) {
            return false;
        }
        let urlsIndex = this.getUrlIndex(urlToCache.charAt(0));
        if (this.urlsSet[urlsIndex].has(urlToCache)) {
            console.log(urlToCache + ' already exists');
            return false;
        }

        this.urlsSet[urlsIndex].add(urlToCache);
        this.dirty[urlsIndex] = true;
        ++this.unique;
        return true;
    },

    getUrlIndex: function(c) {

        let pos = 0;
        let charValue = c.charCodeAt(0);

        if (c == '-') {
            return pos;
        }

        ++pos;
        if (c == '.') {
            return pos;
        }

        ++pos;
        if (c >= '0' && c <= '9') {
            return pos + charValue - this.zeroValue;
        }

        pos += (this.NUM_NUMBERS - 1);
        if (c >= 'A' && c <= 'Z') {
            return pos + charValue - this.AValue;
        }

        pos += (this.NUM_LETTERS - 1);
        if (c >= 'a' && c <= 'z') {
            return pos + charValue - this.aValue;
        }

        throw 'invalid character: ' + c;
    },

    getUrlMatch: function(targetSubstr) {
        let urlsIndex = this.getUrlIndex(targetSubstr.charAt(0));
   
        // Produce a sorted array if necessary
        if (this.urlsSet[urlsIndex].size && this.dirty[urlsIndex]) {
            this.urlsArray[urlsIndex] = Array.from(this.urlsSet[urlsIndex]).sort();
            this.dirty[urlsIndex] = false;
        }

        let result = {};
        for (var i = 0; i < this.urlsArray[urlsIndex].length; ++i) {
            let url = this.urlsArray[urlsIndex][i];
            if (url.length < targetSubstr.length) {
                return { found: false }
            }

            let urlTargetSubstr = url.substr(0, targetSubstr.length);

            if (urlTargetSubstr == targetSubstr) {
                return {
                    urlMatch: url,
                    found: true
                }
            }
        }

        return { found: false };
    },

    trimSearchString: function() {
        this.searchString = this.searchString.slice(0, this.searchString.length -1);
    }
};

let urlCache = new UrlCache();

function setVisible(name, visible) {
    let element = document.getElementById(name);
    if (visible) {
        element.classList.remove('hidden');
        element.classList.add('visible');
    } else {
        element.classList.remove('visible');
        element.classList.add('hidden');
    }
    console.log('name: ' + element.classList);
}

function keyPressHandler(evt) {
    let c = evt.key;
    if (evt.key.length > 1) {
        if (evt.key != 'Backspace') {
            return;
        }

        urlCache.trimSearchString();
        c = '';
    }
    let url = urlCache.getFromCache(c);
    setVisible('url-added-label', false);
    document.getElementById('url-added').innerHTML = '';
    document.getElementById('url-output').innerHTML = url;
}

function urlEnterResetHandler() {
    urlCache.initGetFromCache();
    setVisible('url-added-label', false);
    document.getElementById('url-added').innerHTML = '';
    document.getElementById('url-output').innerHTML = '';
}

function addHandler() {
    let url = document.getElementById('url-input').value;
    urlCache.addToCache(url);
    urlCache.initGetFromCache();

    document.getElementById('url-input').value = '';
    document.getElementById('url-output').innerHTML = '';
    setVisible('url-added-label', true);
    document.getElementById('url-added').innerHTML = url;
    setVisible('url-added', true);
}

function urlPopulateChangeHandler(evt) {
    let f = evt.target.files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            let contents = e.target.result;
            console.log('loaded file ' + f.name);
            for (let beginPos = 0, endPos = contents.indexOf('\n', beginPos);
                endPos != -1;
                beginPos = endPos + 1) {
                endPos = contents.indexOf('\n', beginPos);
                if (endPos != -1) {
                    let url = contents.substr(beginPos, endPos - beginPos);
                    urlCache.addToCache(url);
                }
            }
            document.getElementById('urls-loaded').innerHTML = urlCache.unique;
            setVisible('urls-loaded-label', true);
            setVisible('urls-loaded', true);
        }
        r.readAsText(f);
    }
    setVisible('url-added-label', false);
    document.getElementById('url-added').innerHTML = '';
}

