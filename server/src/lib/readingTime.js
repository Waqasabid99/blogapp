const WORDS_PER_MINUTE = 225;

// extra seconds added for media blocks
const MEDIA_TIME = {
  image: 12,
  embed: 20,
  video: 20
};

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ");
}

function extractWords(text = "") {
  const clean = stripHtml(text)
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return 0;

  return clean.split(" ").length;
}

export function calculateReadingTime(editorContent) {
  if (!editorContent || !editorContent.blocks) {
    return { minutes: 0, words: 0 };
  }

  let totalWords = 0;
  let extraSeconds = 0;

  for (const block of editorContent.blocks) {
    const data = block.data || {};

    switch (block.type) {
      case "paragraph":
      case "header":
      case "quote":
      case "list":
        totalWords += extractWords(JSON.stringify(data));
        break;

      case "code":
        totalWords += extractWords(data.code);
        break;

      case "table":
        totalWords += extractWords(JSON.stringify(data.content));
        break;

      case "image":
        extraSeconds += MEDIA_TIME.image;
        break;

      case "embed":
        extraSeconds += MEDIA_TIME.embed;
        break;

      default:
        totalWords += extractWords(JSON.stringify(data));
    }
  }

  const readingTimeMinutes = totalWords / WORDS_PER_MINUTE;
  const totalSeconds = readingTimeMinutes * 60 + extraSeconds;

  const minutes = Math.max(1, Math.ceil(totalSeconds / 60));

  return {
    readingTime: minutes,
    wordCount: totalWords
  };
}