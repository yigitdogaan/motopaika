#!/usr/bin/env python3
"""Motopaika Slack yardımcısı (kanal: SLACK_KANAL, varsayılan "ofis").

  slack.py post <rol> <dosya|->        Mesajı rolün adıyla gönderir, ts yazdırır ('-' = stdin)
  slack.py kurucu <son_ts>             <son_ts>'den sonra kurucunun yazdığı mesajları ve
                                       rapor altındaki cevaplarını listeler; sonda SON_TS=... yazar
"""
import json, os, sys, time, urllib.parse, urllib.request

TOKEN = os.environ.get("SLACK_BOT_TOKEN") or sys.exit("SLACK_BOT_TOKEN yok; Slack adımı atlandı.")
KANAL = os.environ.get("SLACK_KANAL", "ofis")
EKIP = "ofis/durum/ekip.json"
IKON = {"ceo": ":briefcase:", "urun-tasarim": ":art:", "cto": ":computer:",
        "test": ":test_tube:", "moderasyon-hukuk": ":scales:"}


def api(method, params, post=False):
    url = "https://slack.com/api/" + method
    head = {"Authorization": "Bearer " + TOKEN}
    if post:
        head["Content-Type"] = "application/json; charset=utf-8"
        req = urllib.request.Request(url, data=json.dumps(params).encode(), headers=head)
    else:
        req = urllib.request.Request(url + "?" + urllib.parse.urlencode(params), headers=head)
    r = json.load(urllib.request.urlopen(req, timeout=30))
    if not r.get("ok"):
        sys.exit("Slack hatası (%s): %s" % (method, r.get("error")))
    return r


def kanal_id():
    cursor = ""
    while True:
        r = api("conversations.list", {"limit": 200, "exclude_archived": "true",
                                       "types": "public_channel", "cursor": cursor})
        for c in r["channels"]:
            if c["name"] == KANAL.lstrip("#"):
                return c["id"]
        cursor = r.get("response_metadata", {}).get("next_cursor", "")
        if not cursor:
            sys.exit("Slack kanalı bulunamadı: #" + KANAL)


def insan(m):
    return "user" in m and not m.get("bot_id") and not m.get("subtype")


def saat(ts):
    return time.strftime("%d.%m %H:%M", time.gmtime(float(ts) + 3 * 3600))


def main(a):
    if len(a) < 2:
        sys.exit(__doc__)
    kid = kanal_id()
    if a[0] == "post":
        rol = a[1]
        metin = sys.stdin.read() if len(a) < 3 or a[2] == "-" else open(a[2], encoding="utf-8").read()
        try:
            k = json.load(open(EKIP, encoding="utf-8")).get(rol, {})
            isim = "%s (%s)" % (k["ad"], k["unvan"])
        except Exception:
            isim = rol
        r = api("chat.postMessage", {"channel": kid, "text": metin, "username": isim,
                                     "icon_emoji": IKON.get(rol, ":robot_face:")}, post=True)
        print(r["ts"])
    elif a[0] == "kurucu":
        son = float(a[1] or 0)
        bak = min(son, time.time() - 2 * 86400) if son else time.time() - 2 * 86400
        r = api("conversations.history", {"channel": kid, "limit": 200, "oldest": str(bak)})
        bulunan = []
        for m in r["messages"]:
            if insan(m) and float(m["ts"]) > son:
                bulunan.append(m)
            if m.get("reply_count"):
                rr = api("conversations.replies", {"channel": kid, "ts": m["ts"], "limit": 200})
                bulunan += [x for x in rr["messages"][1:] if insan(x) and float(x["ts"]) > son]
        bulunan.sort(key=lambda m: float(m["ts"]))
        for m in bulunan:
            print("[%s] KURUCU: %s" % (saat(m["ts"]), m.get("text", "").replace("\n", " / ")))
        if not bulunan:
            print("(kurucudan yeni mesaj yok)")
        print("SON_TS=%s" % (bulunan[-1]["ts"] if bulunan else (a[1] or "0")))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
