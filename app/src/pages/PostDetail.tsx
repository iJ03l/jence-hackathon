import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  Send,
  Share2,
  ArrowBigUp,
  ArrowBigDown,
  Check,
} from "lucide-react";
import { linkifyText } from "../lib/linkify";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (postId: string) => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.getCommunityPost(postId, user?.id),
        api.getComments(postId),
      ]);
      setPost(postRes);
      setComments(commentsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value: number) => {
    if (!user || !post) return;

    const previousVote = post.userVote || 0;
    const previousScore = post.likes || 0;

    let newVote = value;
    let newScore = previousScore;

    if (previousVote === value) {
      // Toggle off
      newVote = 0;
      newScore -= value;
    } else {
      // Change vote
      newVote = value;
      newScore += value - previousVote;
    }

    // Optimistic update
    setPost((prev: any) => ({ ...prev, userVote: newVote, likes: newScore }));

    try {
      if (newVote === 0) {
        await api.unvoteCommunityPost(post.id, user.id);
      } else {
        await api.voteCommunityPost(post.id, user.id, newVote);
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setPost((prev: any) => ({
        ...prev,
        userVote: previousVote,
        likes: previousScore,
      }));
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || !post) return;
    setSubmittingComment(true);
    try {
      await api.createComment(post.id, user.id, newComment);
      setNewComment("");
      // Refresh comments
      const commentsRes = await api.getComments(post.id);
      setComments(commentsRes);
      // Update counts
      setPost((prev: any) => ({
        ...prev,
        comments: Number(prev.comments) + 1,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <article className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 animate-pulse">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-full bg-muted rounded-lg mb-4"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div>
              <div className="h-4 w-32 bg-muted rounded-lg mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded-lg"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded-lg"></div>
            <div className="h-4 w-full bg-muted rounded-lg"></div>
            <div className="h-4 w-3/4 bg-muted rounded-lg"></div>
          </div>
        </div>
      </article>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 text-center">
        <p className="text-muted-foreground mb-4">Post not found</p>
        <Link to="/community" className="btn-primary inline-flex">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        {/* Main Post */}
        <div className="card-plug p-4 sm:p-6 mb-8">
          <div className="flex gap-3 sm:gap-4">
            <Link
              to={`/${post.author?.username}`}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
            >
              {post.author?.image ? (
                <img
                  src={post.author.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                  {(post.author?.displayName || "?")[0].toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link
                  to={`/${post.author?.username}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {post.author?.displayName}
                </Link>
                {post.author?.isCreator && (
                  <span className="bg-jence-gold/10 text-jence-gold text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                    Creator
                  </span>
                )}
                <span className="text-muted-foreground text-xs truncate">
                  @{post.author?.username}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-foreground sm:text-lg whitespace-pre-wrap break-words mb-4">
                {linkifyText(post.content.replace(/#[\w]+/gi, "").trim())}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: any) => (
                    <Link
                      key={tag.name}
                      to={`/community?tag=${tag.name}`}
                      className="text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
                      style={{ color: tag.color }}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                  <button
                    onClick={() => handleVote(1)}
                    className={`p-1.5 rounded hover:bg-muted transition-colors ${post.userVote === 1 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    <ArrowBigUp
                      size={24}
                      fill={post.userVote === 1 ? "currentColor" : "none"}
                    />
                  </button>
                  <span
                    className={`text-base font-bold min-w-[1.5em] text-center ${post.userVote === 1 ? "text-orange-500" : post.userVote === -1 ? "text-blue-500" : "text-muted-foreground"}`}
                  >
                    {post.likes || 0}
                  </span>
                  <button
                    onClick={() => handleVote(-1)}
                    className={`p-1.5 rounded hover:bg-muted transition-colors ${post.userVote === -1 ? "text-blue-500" : "text-muted-foreground"}`}
                  >
                    <ArrowBigDown
                      size={24}
                      fill={post.userVote === -1 ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle size={18} />
                  <span>{post.comments}</span>
                </div>
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/community/post/${post.id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: "Jence Community",
                          text: "Check out this discussion on Jence!",
                          url,
                        });
                      } catch (e) {
                        console.error("Error sharing", e);
                      }
                    } else {
                      navigator.clipboard.writeText(url);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ml-auto ${isCopied ? "text-jence-green" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        {user ? (
          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
              {user.image ? (
                <img src={user.image} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post your reply..."
                className="w-full bg-muted/30 border border-border rounded-xl p-3 focus:border-jence-gold/50 focus:ring-1 focus:ring-jence-gold/20 outline-none text-foreground resize-none h-24 placeholder:text-muted-foreground/50 transition-all pr-12"
              />
              <button
                onClick={handleComment}
                disabled={submittingComment || !newComment.trim()}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-jence-gold text-jence-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jence-gold/90 transition-colors"
              >
                {submittingComment ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/20 rounded-xl mb-8">
            <p className="text-muted-foreground mb-4">
              Log in to join the conversation
            </p>
            <Link to="/login" className="btn-primary inline-flex">
              Log In
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-border/50 bg-background/50"
            >
              <div className="flex gap-3">
                <Link
                  to={`/${comment.user?.username}`}
                  className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                >
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs">
                      {(comment.user?.displayName || "?")[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link
                      to={`/${comment.user?.username}`}
                      className="font-semibold text-sm text-foreground hover:underline"
                    >
                      {comment.user?.displayName}
                    </Link>
                    {comment.user?.isCreator && (
                      <span className="bg-jence-gold/10 text-jence-gold text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        Creator
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs truncate">
                      @{comment.user?.username}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground/90 text-sm whitespace-pre-wrap break-words">
                    {linkifyText(comment.content)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to reply!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
