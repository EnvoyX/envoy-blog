import { useState } from 'react'
import { Button } from '../ui/button'

interface CommentInputProps {
  handleAddComment: (commonText: string) => void
}

export default function CommentInput({ handleAddComment }: CommentInputProps) {
  const [commentText, setCommentText] = useState('')
  return (
    <div className="flex-1 space-y-3">
      <textarea
        placeholder="Write a thoughtful comment..."
        value={commentText}
        onChange={(e) => {
          setCommentText(e.target.value)
        }}
        className="w-full min-h-25 p-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-200 placeholder:text-slate-600 resize-none"
      />
      <div className="flex justify-end">
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 cursor-pointer"
          disabled={!commentText.trim()}
          onClick={() => {
            handleAddComment(commentText)
            setCommentText('')
          }}
        >
          Post Comment
        </Button>
      </div>
    </div>
  )
}
