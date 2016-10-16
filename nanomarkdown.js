/**
 * nanomarkdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

    function replace(rex, fn) {
        src = src.replace(rex, fn);
    }

    function element(tag, content) {
        return "<" + tag + ">" + content + "</" + tag + ">";
    }

    function blockquote(src) {
        return src.replace(/\n *&gt; *([^]*?)(?=(\n|$){2})/g, function(all, content) {
            return element("blockquote", blockquote(content.replace(/^ *&gt; */gm,"")));
        });
    }

    function highlight(src) {
        return src.replace(/(^|\W|_)(([*_])|(~)|`)(\2?)([^<]*?)\2\5(?!\2)(?=\W|_|$)/g,
            function(all, _, p1, bi, ss, p2, content) {
                return element(
                      bi ? (p2 ? "b" : "i")
                    : ss ? (p2 ? "s" : "sub") : "code",
                    highlight(content));
            });
    }

    var stash = [];
    var si = 0;

    src = "\n" + src + "\n";

    replace(/</g, "&lt;");
    replace(/>/g, "&gt;");
    replace(/\t/g, "  ");
    replace(/\r/g, "");

    src = blockquote(src);

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
                return rep + element("li", content);
            }) + close.join("");
    });

    // code
    replace(/\n((```|~~~).*\n?([^]*?)\2|((    .*?\n)+))/g, function(all, p1, p2, p3, p4) {
        stash[si] = element("pre", element("code", p3||p4.replace(/^    /gm, "")));
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
    replace(/(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g, function(all, _, p1, p2) {
        return _ + element("h" + p1.length, p2);
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
