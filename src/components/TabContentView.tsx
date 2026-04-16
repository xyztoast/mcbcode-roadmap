import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RichTextBlock from "./RichTextBlock";
import { Plus, Trash2 } from "lucide-react";

interface ContentBlock {
  id: string;
  tab_id: string;
  block_type: string;
  content: string;
  sort_order: number;
}

const TabContentView = ({ tabId }: { tabId: string }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const { isAuthed } = useAuth();
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("tab_content_blocks")
        .select("*")
        .eq("tab_id", tabId)
        .order("sort_order", { ascending: true });
      if (data) setBlocks(data as ContentBlock[]);
    };
    fetch();
  }, [tabId]);

  const addBlock = async () => {
    const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.sort_order)) + 1 : 0;
    const { data } = await supabase
      .from("tab_content_blocks")
      .insert({ tab_id: tabId, block_type: "text", content: "", sort_order: maxOrder })
      .select()
      .single();
    if (data) setBlocks(prev => [...prev, data as ContentBlock]);
  };

  const updateBlock = async (id: string, content: string) => {
    await supabase
      .from("tab_content_blocks")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("tab_content_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOver.current = idx;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks.splice(dragItem.current, 1)[0];
    newBlocks.splice(dragOver.current, 0, draggedBlock);

    // Reassign sort_order
    const updated = newBlocks.map((b, i) => ({ ...b, sort_order: i }));
    setBlocks(updated);
    dragItem.current = null;
    dragOver.current = null;

    // Persist all new orders
    await Promise.all(
      updated.map(b =>
        supabase.from("tab_content_blocks").update({ sort_order: b.sort_order }).eq("id", b.id)
      )
    );
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && !isAuthed && (
        <p className="text-muted-foreground text-center py-12">No content yet.</p>
      )}
      {blocks.map((block, idx) => (
        <div
          key={block.id}
          className="bg-card border border-border p-4 group relative"
          draggable={isAuthed}
          onDragStart={() => handleDragStart(idx)}
          onDragEnter={() => handleDragEnter(idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {isAuthed && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="p-1 text-muted-foreground cursor-grab active:cursor-grabbing text-xs select-none">⠿</span>
              <button onClick={() => deleteBlock(block.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          )}
          <RichTextBlock
            content={block.content}
            editable={isAuthed}
            onChange={(html) => updateBlock(block.id, html)}
          />
        </div>
      ))}
      {isAuthed && (
        <button
          onClick={addBlock}
          className="w-full py-3 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Content Block
        </button>
      )}
    </div>
  );
};

export default TabContentView;
