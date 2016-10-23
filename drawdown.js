/**
 * drawdown.js
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
        return src.replace(/\n *&gt; *([^]*?)(?=(\n|$){2})/g,
        function(all, content) {
            return element("blockquote", blockquote(content.replace(/^ *&gt; */gm,"")));
        });
    }

    function list(src) {
        return src.replace(/\n( *)([*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g,
        function(all, ind, _, ol, num, low, content) {
            var rind = "\n {0," + (ind.length+1) + "}";
            var entry = content.split(
                RegExp(rind + "(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +", "g")).map(list);

            return (ol
                ? "<ol start='" + (num
                    ? ol + "'>"
                    : (parseInt(ol,36)-9) + "' style='list-style-type:" + (low ? "low" : "upp") + "er-alpha'>")
                : "<ul>")
                + element("li", highlight(entry.join("</li>\n<li>").replace(RegExp(rind,"g"),"\n")))
                + (ol ? "</ol>" : "</ul>");
        });
    }

    function highlight(src) {
        return src.replace(/(^|\W|_)(([*_])|(~)|`)(\2?)([^<]*?)\2\5(?!\2)(?=\W|_|$)/g,
        function(all, _, p1, bi, ss, p2, content) {
            return _ + element(
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
    replace(/\t|\r/g, "  ");

    // blockquote
    src = blockquote(src);

    // horizontal rule
    replace(/^([*\-=_] *){3,}$/gm, "<hr/>");

    // list
    src = list(src);

    // code
    replace(/\n((```|~~~).*\n?([^]*?)\2|((    .*?\n)+))/g, function(all, p1, p2, p3, p4) {
        stash[--si] = element("pre", element("code", p3||p4.replace(/^    /gm, "")));
        return si + "\r";
    });

    // link or escape
    replace(/((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g, function(all, p1, p2, p3, p4, p5, p6) {
        stash[--si] = p4
            ? (p2
                ? "<img src='" + p4 + "' alt='" + p3 + "'/>"
                : p3.link(p4))
            : p6;
        return si + "\r";
    });

    // heading
    replace(/(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g, function(all, _, p1, p2) {
        return _ + element("h" + p1.length, highlight(p2));
    });

    // paragraph
    replace(/(?=^|>|\n)\n+([^<]+?)\n+(?=\n|<|$)/g, function(all, c) {
        return element("p", highlight(c));
    });

    // stash
    replace(/-\d+\r/g, function(all) {
        return stash[+all];
    });

    return src;
};
