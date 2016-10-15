/**
 * nanomarkdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

    function replace(rex, fn) {
        src = src.replace(rex, fn);
    }

    function highlight(src) {
        return src.replace(/\B([*_~`])(\1?)([^<]*?)\1\2(?!\1)\B/g, function(all, p1, p2, content) {
            var tag = {
                "*": "bi",
                "_": "bi",
                "~": ["s","sub"],
                "`": ["code","code"]
            } [p1][~~!p2] + ">";
            return "<" + tag + highlight(content) + "</" + tag;
        });
    }

    var stash = [];
    var si = 0;

    src = "\n" + src + "\n";

    replace(/</g, "&lt;");
    replace(/>/g, "&gt;");
    replace(/\t/g, "  ");
    replace(/\r/g, "");

    // horizontal rule
    replace(/^([*\-=_] *){3,}$/gm, "<hr/>");

    // list
    replace(/^( *)([*\-+]|(\d+|[a-zA-Z])[.)]) [^]*?\n$/gm, function(all, base) {
        var close = [];
        return all.replace(/^( *)([*\-+]|((\d+)|([a-z])|[A-Z])[.)]) (.*|)/gm,
            function(all, indent, _, ol, num, low, content) {
                var rep = "";
                var depth = Math.max(0, indent.length - base.length >> 1) + 1;
                while (close.length > depth) {
                    rep += close.pop();
                }
                while (close.length < depth) {
                    rep += ol
                        ? "<ol start='" + (num
                            ? ol + "'>"
                            : (parseInt(ol,36)-9) + "' style='list-style-type:" + (low ? "low" : "upp") + "er-alpha'>")
                        : "<ul>";
                    close.push(ol ? "</ol>" : "</ul>");
                }
                return rep + "<li>" + content + "</li>";
            }) + close.join("");
    });

    // code
    replace(/\n((```|~~~).*\n?([^]*?)\2|((    .*?\n)+))/g, function(all, p1, p2, p3, p4) {
        stash[si] = "<pre><code>" + (p3||p4.replace(/^    /gm, "")) + "</code></pre>";
        return "\r" + (si++) + " ";
    });

    // link or escape
    replace(/((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g, function(all, p1, p2, p3, p4, p5, p6) {
        stash[si] = p4
            ? (p2
                ? "<img src='" + p4 + "' alt='" + p3 + "'/>"
                : p3.link(p4))
            : p6;
        return "\r" + (si++) + " ";
    });

    // heading
    replace(/^(#{1,6}) (.*?)( #*)? *$/gm, function(all, p1, p2) {
        var tag = p1.length + ">";
        return "<h" + tag + p2 + "</h" + tag;
    });

    // paragraph
    replace(/(?=^|>|\n)\n+([^<]+?)\n+(?=\n|<|$)/g, "<p>$1</p>\n");

    src = highlight(src);

    // stash
    replace(/\r(\d+) /g, function(all, index) {
        return stash[index];
    });

    return src;
};
