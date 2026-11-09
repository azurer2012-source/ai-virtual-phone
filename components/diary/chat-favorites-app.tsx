"use client";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { CHAT_FAVORITES_UPDATED, loadChatFavorites, removeChatFavorite, type ChatFavorite } from "@/lib/chat-favorites";

export function ChatFavoritesApp({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<ChatFavorite[]>([]);
  const [selected, setSelected] = useState<ChatFavorite | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setItems(loadChatFavorites());
    refresh(); window.addEventListener(CHAT_FAVORITES_UPDATED, refresh);
    return () => window.removeEventListener(CHAT_FAVORITES_UPDATED, refresh);
  }, []);
  return <section className="diary-app">
    <header className="diary-app-header"><button className="diary-icon-btn" onClick={() => selected ? setSelected(null) : onBack()} aria-label="返回"><ChevronLeft size={20} /></button><div><h1>收藏</h1><p>{selected ? `${selected.messages.length} 条消息 · ${selected.mode === "offline" ? "线下" : "线上"}` : "保存值得回看的对话"}</p></div><span className="diary-header-spacer" /></header>
    <main style={{ padding: 20, overflowY: "auto", flex: 1 }}>
      {error && <p role="alert">{error}</p>}
      {selected ? <><h2>{selected.title}</h2>{selected.messages.map((message, i) => <article key={`${message.id}-${i}`} style={{ margin: "18px 0", padding: 16, borderRadius: 12, background: "var(--c-card, #fff)" }}>
        <strong>{message.senderName}</strong><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.content || (message.mediaType ? `[${message.mediaType}]` : "（空消息）")}</p>
        {message.mediaUrl && message.mediaType === "image" && <img src={message.mediaUrl} alt="收藏的图片" style={{ maxWidth: "100%", borderRadius: 8 }} />}
        {message.mediaType === "sticker" && message.mediaData?.stickerUrl && <img src={message.mediaData.stickerUrl} alt={message.mediaData.label || "表情"} style={{ maxWidth: 180 }} />}
        {message.mediaUrl && message.mediaType === "audio" && <audio controls src={message.mediaUrl} />}
        {message.mediaUrl && message.mediaType === "video" && <video controls src={message.mediaUrl} style={{ maxWidth: "100%" }} />}
        <small>{new Date(message.createdAt).toLocaleString()}</small>
      </article>)}<button className="ui-btn" onClick={async () => { if (!window.confirm("取消这条收藏？原聊天不会删除。")) return; try { await removeChatFavorite(selected.id); setSelected(null); } catch { setError("取消收藏失败，请重试。"); } }}>取消收藏</button></> : <>
        {!items.length && <p className="text-sm text-gray-500">还没有收藏。在聊天气泡菜单中选择“收藏”，也可以多选后合并收藏。</p>}
        {items.map(item => <button key={item.id} onClick={() => { setError(""); setSelected(item); }} style={{ display: "block", textAlign: "left", width: "100%", marginBottom: 12, padding: 18, borderRadius: 14, background: "var(--c-card, #fff)" }}>
          <strong>{item.title}</strong><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.messages[0]?.content.slice(0, 120) || "媒体消息"}</p><small>{item.messages.length} 条 · {item.mode === "offline" ? "线下" : "线上"} · {new Date(item.createdAt).toLocaleString()}</small>
        </button>)}
      </>}
    </main>
  </section>;
}
