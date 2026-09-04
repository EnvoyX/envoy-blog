import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CommentInputProps {
  handleAddComment: (commonText: string) => void;
}

export default function CommentInput({ handleAddComment }: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  return (
    <div className="relative flex items-center gap-3">
      <textarea
        placeholder=""
        value={commentText}
        onChange={(e) => {
          setCommentText(e.target.value);
        }}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none pr-12"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment(commentText);
            setCommentText("");
          }
        }}
      />
      {/*<button
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 font-bold text-xs"
        disabled={!commentText.trim()}
        onClick={() => {
          handleAddComment(commentText);
          setCommentText('');
        }}
      >
        Post
      </button>*/}
      <Button
        className="bg-primary hover:bg-primary/90 rounded-full px-6 cursor-pointer font-bold text-xs"
        disabled={!commentText.trim()}
        onClick={() => {
          handleAddComment(commentText);
          setCommentText("");
        }}
      >
        Post
      </Button>
    </div>
  );
}
