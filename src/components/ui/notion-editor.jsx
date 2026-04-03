import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import PropTypes from "prop-types"
import { useTheme } from "@context/theme-provider"
import { cn } from "@/lib/utils"

export const NotionEditor = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight,
}) => {
  const { theme } = useTheme()

  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  // Creates a new editor instance.
  // We use initialContent if a value exists, otherwise it starts empty.
  const editor = useCreateBlockNote({
    initialContent: value?.length ? value : undefined,
  })

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background overflow-hidden p-4",
        className,
      )}
      style={{ minHeight: minHeight || 180 }}
    >
      <BlockNoteView
        editor={editor}
        onChange={() => {
          // Pass the array of top-level blocks to the parent
          onChange?.(editor.document)
        }}
        theme={resolvedTheme}
      />
    </div>
  )
}

NotionEditor.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  minHeight: PropTypes.number,
}

NotionEditor.defaultProps = {
  value: undefined,
  onChange: undefined,
  placeholder: "Start typing...",
  className: "",
  minHeight: 180,
}

export default NotionEditor
