/**
 * nanomarkdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

    var r;
    var store = [];

    src = ("\n" + src
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "  ")
        .replace(/\r/g, "") + "\n\n")

    // list
    .replace(/^((\s*)([*-]|[\da-zA-Z][.)]) [^\n]+\n)+/gm, function(p0, p1, p2) {
        var rep = "";
        var lines = p0.split("\n");
        var close = [];
        var stat = -1;
        var indent = 0;
        for (var i = 0; i < lines.length; i++) {
            if ((line = /^(\s*)(([*-])|(\d[.)])|([a-z][.)])|([A-Z][.)])) ([^\n]+)/.exec(lines[i]))) {
                var nstat = line[1].length - p2.length >> 1;
                while (stat > nstat) {
                    rep += close.pop();
                    stat--;
                }
                while (stat < nstat) {
                    var tag = line[3] ? ["<ul>","</ul>"]
                            : line[4] ? ["<ol>","</ol>"]
                            : line[6] ? ["<ol style='list-style-type:upper-alpha'>","</ol>"]
                            :           ["<ol style='list-style-type:lower-alpha'>","</ol>"];
                     rep += tag[0];
                     close.push(tag[1]);
                     stat++;
                }
                rep += "<li>" + line[7] + "</li>";
            }
        }
        return "\n" + rep + close.join("") + "\n";
    })

    // code
    .replace(/\n((```|~~~).*\n?((.|\n)*?)\2|((    .*?\n)+))/g, function(p0, p1, p2, p3, p4, p5) {
        store.push("<code>" + (p3||p5).replace(/^    /gm, "") + "</code>");
        return "<" + (store.length-1) + ">";
    })

    // link
    .replace(/!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g, function(p0, p1, p2) {
        store.push(/^!/.test(p0)
            ? "<img src='" + p2 + "' alt='" + p1 + "'/>"
            : p1.link(p2));
        return "<" + (store.length-1) + ">";
    })

    // heading
    .replace(/\n(#{1,6}) (.*?)( \1)?(\n|$)/g, function(p0, p1, p2) {
        var cnt = p1.length;
        return "\n\n<h" + cnt + ">" + p2 + "</h" + cnt + ">\n";
    })

    // horizontal rule
    .replace(/^(?:([*-_] ?)+)\1\1$/gm, "\n<hr/>\n");

    // bold/italic/strikethrough
    while ((r = /(^|\B)(?:(\*{1,2}|_{1,2}|~~))(.*?)\2($|\B)/g.exec(src))) {
        var rep = "sib".charAt(r[2] == "~~" ? 0 : r[2].length);
        src = src.replace(r[0], "<" + rep + ">" + r[3] + "</" + rep + ">");
    }

    for (var i = 0; i < store.length; i++)
        src = src.replace("<" + i + ">", store[i]);

    return src.replace(/((.|\n)*?)\n\s*\n/g, "<p>$1</p>");
};
