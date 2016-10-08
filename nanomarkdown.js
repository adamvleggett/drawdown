/**
 * nanomarkdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

    function highlight(src, done) {
        return src.replace(/((\*\*?|__?)|~~)(\S.*?\S)\1/g, function(p0, p1, p2, p3) {
            var rep = "sib".charAt(p2 ? p2.length : 0);
            return "<" + rep + ">" + (done ? p3 : highlight(p3,1)) + "</" + rep + ">";
        });
    }

    var stash = [];

    return highlight(("\n" + src
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "  ")
        .replace(/\r/g, "") + "\n\n")

    // list
    .replace(/^((\s*)([*\-+]|[\da-zA-Z][.)]) .+?\n)+/gm, function(p0, p1, p2) {
        var rep = "";
        var lines = p0.split("\n");
        var close = [];
        var stat = -1;
        var indent = 0;
        for (var i = 0; i < lines.length; i++) {
            if ((line = /^(\s*)(([*\-+])|(\d[.)])|([a-z][.)])|([A-Z][.)])) ([^\n]+)/.exec(lines[i]))) {
                var nstat = line[1].length - p2.length >> 1;
                while (stat > nstat) {
                    rep += close.pop();
                    stat--;
                }
                while (stat < nstat) {
                    rep += line[3]
                        ? "<ul>"
                        : "<ol" + (line[4]
                            ? ">"
                            : " style='list-style-type:" + (line[6]
                                ? "upper-alpha'>"
                                : "lower-alpha'>"));
                    close.push(line[3] ? "</ul>" : "</ol>");
                    stat++;
                }
                rep += "<li>" + line[7] + "</li>";
            }
        }
        return "\n" + rep + close.join("") + "\n";
    })

    // code
    .replace(/\n((```|~~~).*\n?((.|\n)*?)\2|((    .*?\n)+))/g, function(p0, p1, p2, p3, p4, p5) {
        stash.push("<code>" + (p3||p5.replace(/^    /gm, "")) + "</code>");
        return "<" + (stash.length-1) + ">";
    })

    // link
    .replace(/!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g, function(p0, p1, p2) {
        stash.push(/^!/.test(p0)
            ? "<img src='" + p2 + "' alt='" + p1 + "'/>"
            : p1.link(p2));
        return "<" + (stash.length-1) + ">";
    })

    // heading
    .replace(/^(#{1,6}) (.*?)( \1)?\s*$/gm, function(p0, p1, p2) {
        var cnt = p1.length;
        return "\n\n<h" + cnt + ">" + p2 + "</h" + cnt + ">\n";
    })

    // horizontal rule
    .replace(/^(?:([*\-=_] ?)+)\1\1\s*$/gm, "\n<hr/>\n"))

    // stash
    .replace(/<(\d+)>/g, function(p0, p1) {
        return stash[p1];
    })

    .replace(/((.|\n)*?)\n\s*\n/g, "<p>$1</p>");
};
