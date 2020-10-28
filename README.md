# drawdown

---

Tiny but reliable Markdown to HTML conversion in JavaScript

Supported Markdown features:

#### Headings

Inline styles such as **bold**, *italic*, ***both***, ~~strikethrough~~, `monospace`, --subscript--, and ^^superscript^^.

> Block quotes, including
> > nested block quotes.

```
Fenced code blocks
```

    Indented code blocks

1. Numbered lists
  - Unordered lists
  - Nested in other lists
    a. Lettered lists are an extension to the spec.
    b. They may be useful for legal documents.
2. Another entry in my numbered list.

| Tables | Tables | Tables |
| ------ | ------ | ------ |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |
| Cell 7 | Cell 8 | Cell 9 |

[Links](https://github.com/adamvleggett/drawdown)

Images:

![Images](https://img.icons8.com/ios/452/stack-of-photos.png)

---

### Summary...

These are the supported features:

- Block quotes
- Code blocks
- Links
- Images
- Headings
- Lists (including lettered lists)
- Bold
- Italic
- Strikethrough
- Monospace
- Subscript
- Horizontal rule
- Tables

Unsupported Markdown features at this time:

- Line blocks
- Definition lists
- Footnotes
- Twitter/Facebook/YouTube embed
- Inline math equations

To use:

    element.innerHTML = markdown(text);