"use client";
import { useState, useRef, useEffect } from "react";
import { debounce } from "lodash";
import api from "@/api/api";

const debouncedSave = debounce(async (api, onChange) => {
  const data = await api.saver.save();
  onChange(data);
}, 500);

function useEditorJs(holderId, onChange, enabled = true) {
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (editorRef.current) return; // already initialised

    let editor;

    const init = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Code = (await import("@editorjs/code")).default;
      const Delimiter = (await import("@editorjs/delimiter")).default;
      const InlineCode = (await import("@editorjs/inline-code")).default;
      const Marker = (await import("@editorjs/marker")).default;
      const Embed = (await import("@editorjs/embed")).default;
      const Table = (await import("@editorjs/table")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const Warning = (await import("@editorjs/warning")).default;
      const Checklist = (await import("@editorjs/checklist")).default;
      const LinkTool = (await import("@editorjs/link")).default;

      editor = new EditorJS({
        holder: holderId,
        placeholder: "Start writing your story…",
        autofocus: false,
        tools: {
          header: {
            class: Header,
            config: { levels: [2, 3, 4], defaultLevel: 2 },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: { defaultStyle: "unordered" },
          },
          checklist: { class: Checklist, inlineToolbar: true },
          quote: { class: Quote, inlineToolbar: true },
          code: Code,
          inlineCode: { class: InlineCode, shortcut: "CMD+SHIFT+M" },
          marker: { class: Marker, shortcut: "CMD+SHIFT+H" },
          delimiter: Delimiter,
          table: { class: Table, inlineToolbar: true },
          embed: {
            class: Embed,
            config: {
              services: { youtube: true, codepen: true, twitter: true },
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file) => {
                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const { data } = await api.post("/media/upload", formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                      withCredentials: true,
                    });

                    return {
                      success: 1,
                      file: {
                        url:
                          data?.data?.media?.url ??
                          data?.data?.cloudinaryData?.url,
                      },
                    };
                  } catch (error) {
                    console.error("Image upload failed:", error);
                    return { success: 0 };
                  }
                },
                uploadByUrl: async (url) => ({
                  success: 1,
                  file: { url },
                }),
              },
            },
          },
          warning: Warning,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/link-preview`,
            },
          },
        },
        onChange: (api) => {
          debouncedSave(api, onChange);
        },
        onReady: () => setReady(true),
      });

      editorRef.current = editor;
    };

    init().catch(console.error);

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        setReady(false);
      }
    };
  }, [enabled, holderId, onChange]);

  return { editorRef, ready };
}

export default useEditorJs;
