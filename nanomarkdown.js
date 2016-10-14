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

    return highlight(("\n" + src + "\n")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "  ")
        .replace(/\r/g, "")

    // horizontal rule
    .replace(/^([*\-=_] *){3,}$/gm, "<hr/>")

    // list
    .replace(/^( *)([*\-+]|[\da-zA-Z][.)]) [^]*?\n$/gm, function(all, base) {
        var close = [];
        return all.replace(/^( *)(([*\-+])|(\d[.)])|([a-z][.)])|[A-Z][.)])( .*|)/gm,
            function(all, indent, _, ul, ol, low, content) {
                var rep = "";
                var depth = Math.max(0, indent.length - base.length >> 1) + 1;
                while (close.length > depth) {
                    rep += close.pop();
                }
                while (close.length < depth) {
                    rep += ul
                        ? "<ul>"
                        : "<ol" + (ol
                            ? ">"
                            : " style='list-style-type:" + (low ? "low" : "upp") + "er-alpha'>");
                    close.push(ul ? "</ul>" : "</ol>");
                }
                return rep + "<li>" + content + "</li>";
            }) + close.join("");
    })

    // code
    .replace(/\n((```|~~~).*\n?([^]*?)\2|((    .*?\n)+))/g, function(all, p1, p2, p3, p4) {
        stash[si] = "<code>" + (p3||p4.replace(/^    /gm, "")) + "</code>";
        return "\r" + (si++) + " ";
    })

    // link
    .replace(/(!?)\[(.*?)\]\((.*?)( ".*")?\)/g, function(all, p1, p2, p3) {
        stash[si] = p1
            ? "<img src='" + p3 + "' alt='" + p2 + "'/>"
            : p2.link(p3);
        return "\r" + (si++) + " ";
    })

    // heading
    .replace(/^(#{1,6}) (.*?)( \1)?\s*$/gm, function(all, p1, p2) {
        var tag = p1.length + ">";
        return "<h" + tag + p2 + "</h" + tag;
    })

    // paragraph
    .replace(/(?=^|>|\n)\n+([^<]+?)\n+(?=\n|<|$)/g, "<p>$1</p>\n"))

    // stash
    .replace(/\r(\d+) /g, function(all, index) {
        return stash[index];
    });
};
