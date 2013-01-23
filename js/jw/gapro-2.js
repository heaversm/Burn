(function (a) {
    var c = "gapro";
    var b = function (q, f, d) {
            var j = {
                trackingobject: "_gaq",
                trackstarts: true,
                trackpercentage: true,
                tracktime: true,
                debug: false,
                currentItem: undefined,
                pageURL: undefined
            };
            var n = a.utils.extend({}, j, f);
            for (var s in n) {
                if (n[s] == "true") {
                    n[s] = true
                } else {
                    if (n[s] == "false") {
                        n[s] = false
                    }
                }
            }
            h("Initializing");
            if (typeof n.trackingobject == "string" && typeof window[n.trackingobject] == "undefined") {
                h("Could not setup because trackingobject is not defined.");
                return
            }
            function o() {
                if (typeof n.trackingobject == "string") {
                    return window[n.trackingobject]
                }
                return n.trackingobject
            }
            function k(t, w) {
                var z;
                if (typeof w != "undefined") {
                    z = w;
                    var y = w.split("||");
                    for (var u = 0; u < y.length; u++) {
                        var B = y[u];
                        if (typeof t[B] != "undefined") {
                            var v = "\\|\\|" + B + "\\|\\|";
                            var A = new RegExp(v, "g");
                            z = z.replace(A, t[B])
                        }
                    }
                } else {
                    if (t.streamer) {
                        var x = t.streamer;
                        if (x.lastIndexOf("/") != x.length) {
                            x += "/"
                        }
                        z = x + t.file
                    } else {
                        z = a.utils.getAbsolutePath(t.file)
                    }
                }
                return z
            }
            function m() {
                n.currentItem = a.utils.extend(n.currentItem, {
                    started: false,
                    secondsPlayed: 0,
                    percentageMap: {},
                    lastTime: 0,
                    lastPercentage: 0
                })
            }
            function g() {
                try {
                    window.attachEvent("onbeforeunload", function (u) {
                        i()
                    })
                } catch (t) {}
                try {
                    window.addEventListener("beforeunload", function (u) {
                        i()
                    }, false)
                } catch (t) {}
                q.onIdle(function (u) {
                    i()
                });
                q.onPlaylistItem(function (v) {
                    n.pageURL = window.top == window ? window.location.href : document.referrer;
                    n.currentItem = {};
                    m();
                    var u = q.getPlaylistItem(v.index);
                    if (typeof u["gapro.idstring"] == "string") {
                        n.currentItem.mediaID = k(u, u["gapro.idstring"])
                    } else {
                        if (typeof n.idstring == "string") {
                            n.currentItem.mediaID = k(u, n.idstring)
                        } else {
                            n.currentItem.mediaID = k(u)
                        }
                    }
                    if (typeof u["gapro.hidden"] != "undefined") {
                        n.currentItem.hidden = u["gapro.idstring"]
                    } else {
                        n.currentItem.hidden = false
                    }
                });
                q.onTime(function (v) {
                    if (!n.currentItem.started) {
                        n.currentItem.started = true;
                        r("Video Plays");
                        return
                    }
                    var x = v.position - n.currentItem.lastTime;
                    var u = Math.ceil(v.position / v.duration * 100);
                    if (u > 100) {
                        u = 100
                    }
                    if (0 < x && x < 0.5) {
                        n.currentItem.secondsPlayed += x;
                        if (n.currentItem.lastPercentage != u) {
                            for (var w = n.currentItem.lastPercentage; w <= u; w++) {
                                n.currentItem.percentageMap[w] = true
                            }
                        }
                    } else {
                        h("Detected " + x + " second seek - ignoring")
                    }
                    n.currentItem.lastTime = v.position;
                    n.currentItem.lastPercentage = u
                })
            }
            function i() {
                var v = a.utils.extend({}, n.currentItem);
                m();
                if (v.secondsPlayed > 0) {
                    r("Seconds Played", Math.round(v.secondsPlayed));
                    var t = 0;
                    for (var u = 0; u < 100; u++) {
                        if (v.percentageMap[u]) {
                            t++
                        }
                    }
                    r("Percentage Played", t)
                }
            }
            function p(t) {
                switch (t) {
                case "Video Plays":
                    if (n.trackstarts) {
                        return true
                    }
                    break;
                case "Seconds Played":
                    if (n.tracktime) {
                        return true
                    }
                    break;
                case "Percentage Played":
                    if (n.trackpercentage) {
                        return true
                    }
                    break
                }
                return false
            }
            function r(v, u) {
                var t = "Not tracked";
                if (!n.currentItem.hidden && p(v)) {
                    if (typeof o()._trackEvent != "undefined") {
                        t = "Tracked Synchronously";
                        l(v, n.currentItem.mediaID, n.pageURL, u)
                    } else {
                        if (typeof o().push != "undefined") {
                            t = "Tracked Asynchronously";
                            e(v, n.currentItem.mediaID, n.pageURL, u)
                        }
                    }
                } else {
                    if (n.currentItem.hidden) {
                        t += " - current item is hidden"
                    } else {
                        if (!p(v)) {
                            t += " - tracking of " + v + " is disabled"
                        }
                    }
                }
                h(t, {
                    Category: v,
                    //Action: n.currentItem.mediaID, //MH Changed per request of Fitz
                    //Label: n.pageURL,
                    Action: 'CLICK', 
                    Label: n.currentItem.mediaID, 
                    Value: u
                })
            }
            function e(u, w, t, v) {
                if (typeof v != "undefined") {
                    o().push(["_trackEvent", u, w, t, v]);
                    return
                }
                o().push(["_trackEvent", u, w, t])
            }
            function l(u, w, t, v) {
                if (typeof v != "undefined") {
                    o()._trackEvent(u, w, t, v);
                    return
                }
                o()._trackEvent(u, w, t)
            }
            function h(u, t) {
                if (n.debug) {
                    a.utils.log(c + ": " + u, t)
                }
            }
            g()
        };
    a().registerPlugin(c, b)
})(jwplayer);