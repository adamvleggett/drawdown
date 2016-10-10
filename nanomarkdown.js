/**
 * nanomarkdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

    function highlight(src, done) {
        return src.replace(/((\*\*?|__?)|~~)(\S(.*?(?!\1)\S)??)\1(?!\1)/g, function(all, p1, p2, p3) {
            var tag = "sib".charAt(p2 ? p2.length : 0) + ">";
            return "<" + tag + (done ? p3 : highlight(p3,1)) + "</" + tag;
        });
    }

    var stash = [];
    var si = 0;

    return highlight(("\n" + src
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "  ")
        .replace(/\r/g, "") + "\n\n")

    // list
    .replace(/^((\s*)([*\-+]|[\da-zA-Z][.)])( .*)?\n)+/gm, function(all, p1, p2) {
        var rep = "";
        var close = [];
        var stat = -1;
        all.replace(/^(\s*)(([*\-+])|(\d[.)])|([a-z][.)])|([A-Z][.)]))( .*|)/gm, function(all, l1, l2, l3, l4, l5, l6, l7) {
            var nstat = l1.length - p2.length >> 1;
            while (stat > nstat) {
                rep += close.pop();
                stat--;
            }
            while (stat < nstat) {
                rep += l3
                    ? "<ul>"
                    : "<ol" + (l4
                        ? ">"
                        : " style='list-style-type:" + (l6
                            ? "upper-alpha'>"
                            : "lower-alpha'>"));
                close.push(l3 ? "</ul>" : "</ol>");
                stat++;
            }
            rep += "<li>" + l7 + "</li>";
            return "";
        });
        return "\n" + rep + close.join("") + "\n";
    })

    // code
    .replace(/\n((```|~~~).*\n?((.|\n)*?)\2|((    .*?\n)+))/g, function(all, p1, p2, p3, p4, p5) {
        stash.push("<code>" + (p3||p5.replace(/^    /gm, "")) + "</code>");
        return "<" + (si++) + ">";
    })

    // link
    .replace(/!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g, function(all, p1, p2) {
        stash.push(/^!/.test(all)
            ? "<img src='" + p2 + "' alt='" + p1 + "'/>"
            : p1.link(p2));
        return "<" + (si++) + ">";
    })

    // heading
    .replace(/^(#{1,6}) (.*?)( \1)?\s*$/gm, function(all, p1, p2) {
        var cnt = p1.length;
        return "\n\n<h" + cnt + ">" + p2 + "</h" + cnt + ">\n";
    })

    // horizontal rule
    .replace(/^(?:([*\-=_] ?)+)\1\1\s*$/gm, "\n<hr/>\n"))

    // stash
    .replace(/<(\d+)>/g, function(all, index) {
        return stash[index];
    })

    .replace(/((.|\n)*?)\n\s*\n/g, "<p>$1</p>");
};
